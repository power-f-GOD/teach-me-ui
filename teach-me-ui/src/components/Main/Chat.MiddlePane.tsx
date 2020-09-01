import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  createRef,
  useContext
} from 'react';
import { Link } from 'react-router-dom';

import queryString from 'query-string';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import MinimizeIcon from '@material-ui/icons/Minimize';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import ChatIcon from '@material-ui/icons/Chat';
import MenuIcon from '@material-ui/icons/MenuRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CircularProgress from '@material-ui/core/CircularProgress';
import PersonIcon from '@material-ui/icons/Person';

import {
  ChatState,
  APIMessageResponse,
  UserData,
  ConversationInfo,
  SearchState,
  Partial,
  OnlineStatus
} from '../../constants/interfaces';
import createMemo from '../../Memo';
import { userDeviceIsMobile } from '../../';
import {
  chatState,
  conversationMessages,
  conversationInfo,
  getConversationMessages,
  conversations
} from '../../actions/chat';
import {
  dispatch,
  delay,
  interval,
  preventEnterNewLine,
  formatMapDateString,
  timestampFormatter,
  addEventListenerOnce
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import {
  CHAT_TYPING,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELIVERED
} from '../../constants/chat';
import ConfirmDialog, {
  Message,
  ChatDate,
  SelectedMessageValue,
  ActionChoice
} from './Chat.crumbs';
import { emitUserOnlineStatus } from '../../App';

interface ChatMiddlePaneProps {
  userData: UserData;
  chatState: ChatState;
  webSocket: WebSocket;
  search: string;
  convoFriendship: string;
  convoParticipants: string[];
  convoId: string;
  convoUserTyping: string;
  convoType: string;
  convoDisplayName: string;
  convoAvatar: string;
  convoAssocUsername: string;
  convoMessages: Partial<APIMessageResponse>[];
  convoMessagesErr: boolean;
  convoMessagesStatus: SearchState['status'];
  convoMessagesStatusText: string;
  convoInfoErr: boolean;
  convoInfoData: ConversationInfo['data'];
  convoInfoStatus: ConversationInfo['status'];
  convoInfoOnlineStatus: OnlineStatus;
  convoInfoNewMessage: Partial<APIMessageResponse>;
  convoInfoLastSeen: number;
  handleSetActivePaneIndex(index: number): any;
}

export const ScrollViewContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);
export const MiddlePaneHeaderContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);

const scrollViewRef = createRef<HTMLElement | null>();
const msgBoxRef = createRef<HTMLInputElement | null>();
const moreOptionsContainerRef = createRef<HTMLElement | any>();

let scrollView: HTMLElement | null = null;

const Memoize = createMemo();

let renderAwayDateTimeout: any;
let _canDisplayAwayDate = false;
let lastSeenForAway = Date.now();
let hideScrollBarTimeout: any;
let loadMessagesTimeout: any;
let scrollViewScrollPos = 0;
let messageDrafts: any = {};

const displayAwayDate = () => {
  renderAwayDateTimeout = setTimeout(() => {
    _canDisplayAwayDate = Date.now() - lastSeenForAway > 300000;
    //did the next line to trigger a state change for the feature to really work
    dispatch(conversationInfo({ user_typing: '' }));

    if (!_canDisplayAwayDate) {
      clearTimeout(renderAwayDateTimeout);
      displayAwayDate();
    }

    if (_canDisplayAwayDate || !lastSeenForAway)
      clearTimeout(renderAwayDateTimeout);
  }, 2000);
};

const ChatMiddlePane = (props: Partial<ChatMiddlePaneProps>) => {
  const {
    userData,
    convoDisplayName,
    convoId,
    convoFriendship,
    convoAssocUsername,
    convoInfoOnlineStatus,
    convoMessages: data,
    convoMessagesStatus,
    webSocket: socket
  } = props;
  const convoMessages = data as Partial<APIMessageResponse>[];
  const { chat, cid } = queryString.parse(window.location.search) ?? {};

  const [selectedMessages, setSelectedMessages] = useState<{
    [id: string]: SelectedMessageValue;
  }>({});
  const [clearSelections, setClearSelections] = useState<boolean>(false);

  const handleProfileLinkClick = useCallback(() => {
    dispatch(
      chatState({
        queryString: window.location.search.replace('open', 'min'),
        isMinimized: true
      })
    );
  }, []);

  useEffect(
    () => () => {
      renderAwayDateTimeout = null;
      _canDisplayAwayDate = false;
      lastSeenForAway = Date.now();
      hideScrollBarTimeout = null;
      loadMessagesTimeout = null;
      scrollViewScrollPos = 0;
      messageDrafts = {};
    },
    []
  );

  useEffect(() => {
    if ((cid || convoId) && msgBoxRef.current) {
      msgBoxRef.current.value = messageDrafts[convoId || cid] ?? '';

      if (!userDeviceIsMobile) {
        msgBoxRef.current.focus();
      }
    }
  }, [convoId, cid]);

  useEffect(() => {
    if (!!convoMessages[0] && userData?.online_status === 'ONLINE') {
      const [_isOpen, _isMinimized] = [!!chat, chat === 'min'];
      const isSameCid = convoId === cid;
      const userId = userData.id;

      if (_isOpen && isSameCid && !_isMinimized) {
        dispatch(conversations({ data: [{ unread_count: 0, _id: convoId }] }));
      }

      for (const message of convoMessages) {
        const isSeen = message.seen_by?.includes(userId);

        if (!message.sender_id || userId === message.sender_id || isSeen) {
          continue;
        }

        try {
          if (socket && socket.readyState === 1 && isSameCid) {
            if (_isOpen) {
              const isDelivered = message.delivered_to?.includes(userId);

              if (userDeviceIsMobile) {
                if (!isDelivered) {
                  socket.send(
                    JSON.stringify({
                      message_id: message._id,
                      pipe: CHAT_MESSAGE_DELIVERED
                    })
                  );
                }

                if (!_isMinimized) {
                  socket.send(
                    JSON.stringify({
                      message_id: message._id,
                      pipe: CHAT_READ_RECEIPT
                    })
                  );
                }
              } else {
                socket.send(
                  JSON.stringify({
                    message_id: message._id,
                    pipe:
                      _isMinimized && !isDelivered
                        ? CHAT_MESSAGE_DELIVERED
                        : CHAT_READ_RECEIPT
                  })
                );
              }
            } else continue;
          } else break;
        } catch (e) {
          emitUserOnlineStatus(false, true, {
            open: true,
            message:
              e +
              'An error occurred. Could not establish connection with server.',
            severity: 'error'
          });
          console.error('An error occurred. Error:', e);
          break;
        }
      }
    }
  }, [
    cid,
    convoId,
    chat,
    userData,
    convoMessages,
    convoInfoOnlineStatus,
    socket
  ]);

  return (
    <>
      <Col as='header' className='chat-header d-flex p-0'>
        <Memoize
          memoizedComponent={MiddlePaneHeader}
          convoId={convoId}
          convoDisplayName={convoDisplayName}
          convoInfoOnlineStatus={convoInfoOnlineStatus}
          convoMessagesStatus={convoMessagesStatus}
          selectedMessages={selectedMessages}
          setClearSelections={setClearSelections}
          setSelectedMessages={setSelectedMessages}
          webSocket={socket}
        />
      </Col>

      <Memoize
        memoizedComponent={ScrollView}
        convoMessages={convoMessages}
        convoMessagesStatus={convoMessagesStatus}
        convoFriendship={convoFriendship}
        convoAssocUsername={convoAssocUsername}
        convoId={convoId}
        convoDisplayName={convoDisplayName}
        userId={userData?.id as string}
        clearSelections={clearSelections}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
        handleProfileLinkClick={handleProfileLinkClick}
      />
      <Box className='scroll-bar-fader' />

      <Box
        className='theme-tertiary-lighter d-flex align-items-center justify-content-center messages-status-signal'
        height='100%'
        fontWeight='bold'>
        {convoMessagesStatus === 'fulfilled' &&
        !convoMessages.length &&
        convoId ? (
          <Box fontSize='1.1rem' textAlign='center' maxWidth='100%'>
            <ChatIcon fontSize='large' />
            <br />
            No messages here.
            <br />
            <br />
            {convoFriendship ? (
              <>
                Send a message to begin a new conversation with{' '}
                <Box fontWeight='bold'>{convoDisplayName}.</Box>
              </>
            ) : (
              <>
                You are not colleagues with{' '}
                <Box fontWeight='bold'>{convoDisplayName}.</Box>
                <br />
                Send{' '}
                <Link
                  className='font-bold'
                  onClick={handleProfileLinkClick}
                  to={`/@${convoAssocUsername}${window.location.search.replace(
                    'open',
                    'min'
                  )}`}>
                  {convoDisplayName?.split(' ')[0]}
                </Link>{' '}
                a colleague request to start a conversation.
              </>
            )}
          </Box>
        ) : convoId ? (
          !window.navigator.onLine ? (
            <Box fontSize='1.2rem' textAlign='center'>
              <CloudOffIcon fontSize='large' />
              <br />
              <br />
              Can't load messages. You seem to be offline.
            </Box>
          ) : (
            <Box component='span' fontSize='3rem'>
              . . .
            </Box>
          )
        ) : (
          <Box fontSize='1.1rem' textAlign='center'>
            <ChatIcon fontSize='large' />
            <br />
            <br />
            Start a new conversation.
          </Box>
        )}
      </Box>

      <Memoize
        memoizedComponent={MessageBox}
        convoId={convoId}
        webSocket={socket}
      />
    </>
  );
};

function MiddlePaneHeader(props: {
  convoId: string;
  convoDisplayName: string;
  convoInfoOnlineStatus: OnlineStatus;
  webSocket: WebSocket;
  convoMessagesStatus: SearchState['status'];
  setSelectedMessages: Function;
  selectedMessages: { [key: string]: any };
  setClearSelections: Function;
}) {
  const {
    convoMessagesStatus,
    convoId,
    convoDisplayName,
    convoInfoOnlineStatus,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const {
    chatState: _chatState,
    convoInfoData,
    convoAvatar,
    convoType,
    convoInfoLastSeen,
    convoInfoStatus,
    convoUserTyping,
    handleSetActivePaneIndex
  } = useContext(MiddlePaneHeaderContext);
  const { isMinimized, isOpen } = _chatState as ChatState;
  const canDisplayAwayDate = _canDisplayAwayDate;
  const [lastSeenDate, lastSeenTime] = [
    formatMapDateString(convoInfoData?.last_seen as number),
    timestampFormatter(convoInfoData?.last_seen)
  ];
  const lastAwayDate = `away ${
    canDisplayAwayDate ? 'since ' + lastSeenTime + ', ' + lastSeenDate : ''
  }`;
  const lastOnlineDate = `last seen ${lastSeenDate} at ${lastSeenTime.replace(
    ' ',
    ''
  )}`;
  const numOfSelectedMessages = Object.keys(selectedMessages).length;
  const moreOptionsContainer = moreOptionsContainerRef.current;

  const [moreOptionsContainerIsVisible, setMoreOptionsIsVisible] = useState<
    boolean
  >(false);

  const handleMinimizeChatClick = useCallback(
    (shouldActuallyMinimize?: any) => {
      const { isMinimized, queryString: qString } = _chatState as ChatState;
      let queryString = qString!.replace(
        isMinimized ? 'chat=min' : 'chat=open',
        isMinimized ? 'chat=open' : 'chat=min'
      );

      queryString = shouldActuallyMinimize
        ? queryString
        : queryString.replace('=open', '=min');

      dispatch(
        chatState({
          isMinimized: shouldActuallyMinimize ? !isMinimized : false,
          queryString
        })
      );
      window.history.replaceState({}, '', queryString);
    },
    [_chatState]
  );

  const clickTimeout: any = useRef();
  const handleCloseChatClick = useCallback(() => {
    if (!isOpen || convoMessagesStatus === 'pending') {
      return;
    }

    clearTimeout(clickTimeout.current);
    clickTimeout.current = window.setTimeout(() => {
      dispatch(
        chatState({
          isMinimized: false,
          isOpen: false,
          queryString: ''
        })
      );
      window.history[userDeviceIsMobile ? 'replaceState' : 'pushState'](
        {},
        '',
        window.location.pathname
      );
    }, 400);
  }, [isOpen, convoMessagesStatus]);

  const handleUserInfoOptionClick = useCallback(() => {
    handleMinimizeChatClick(false);
    delay(isMinimized ? 500 : 250).then(() => {
      handleSetActivePaneIndex!(2)();
    });
  }, [isMinimized, handleMinimizeChatClick, handleSetActivePaneIndex]);

  const toggleMoreOptionsPopover = useCallback(() => {
    setMoreOptionsIsVisible((prev) => !prev);
  }, []);

  const handleConversationsMenuClick = useCallback(() => {
    handleMinimizeChatClick(false);
    delay(isMinimized ? 500 : 1).then(() => {
      handleSetActivePaneIndex!(0)();
    });
  }, [isMinimized, handleMinimizeChatClick, handleSetActivePaneIndex]);

  const hideMoreOptionsOnClick = useCallback(() => {
    setMoreOptionsIsVisible(false);
  }, []);

  useEffect(() => {
    if (moreOptionsContainer) {
      moreOptionsContainer.inert = true;
    }
  }, [moreOptionsContainer]);

  useEffect(() => {
    if (moreOptionsContainer) {
      addEventListenerOnce(moreOptionsContainer, () => {
        moreOptionsContainer.inert = !moreOptionsContainerIsVisible;
      });
    }
  }, [moreOptionsContainer, moreOptionsContainerIsVisible]);

  useEffect(() => {
    lastSeenForAway = convoInfoLastSeen as number;
    displayAwayDate();

    if (convoInfoOnlineStatus !== 'AWAY' || canDisplayAwayDate) {
      clearTimeout(renderAwayDateTimeout);
      _canDisplayAwayDate = false;
    }
  }, [convoInfoOnlineStatus, canDisplayAwayDate, convoInfoLastSeen]);

  return (
    <>
      <Row
        className={`title-control-wrapper px-2 mx-0 ${
          numOfSelectedMessages ? 'hide' : 'show'
        }`}>
        <Col as='span' className='colleague-name'>
          <Box
            component='span'
            className='control-wrapper conversations-menu-button-wrapper'>
            <IconButton
              edge='start'
              className='conversations-menu-button ml-0 mr-1'
              color='inherit'
              onClick={handleConversationsMenuClick}
              aria-label='conversations menu'>
              <MenuIcon />
            </IconButton>
          </Box>

          {convoType === 'ONE_TO_ONE' ? (
            <Box
              component='span'
              className='colleague-name-container d-inline-flex align-items-center'
              onClick={
                userDeviceIsMobile ? handleUserInfoOptionClick : undefined
              }>
              <Badge
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                className={`online-badge ${
                  convoInfoStatus === 'fulfilled'
                    ? convoInfoOnlineStatus?.toLowerCase()
                    : 'offline'
                }`}
                overlap='circle'
                variant='dot'>
                <Avatar
                  component='span'
                  className='chat-avatar'
                  alt={convoDisplayName}
                  src={`/images/${convoAvatar}`}
                />
              </Badge>{' '}
              <Col as='span' className='ml-2 p-0'>
                <Col
                  as='span'
                  className={`display-name ${
                    convoInfoStatus === 'pending'
                      ? 'status-hidden'
                      : !convoInfoData?.last_seen
                      ? 'status-hidden'
                      : ''
                  } p-0`}>
                  {convoDisplayName ?? placeHolderDisplayName}
                </Col>
                <Col
                  as='span'
                  className={`status ${
                    convoInfoStatus === 'fulfilled' && convoInfoData?.last_seen
                      ? 'show'
                      : ''
                  } p-0`}>
                  {convoUserTyping
                    ? 'typing...'
                    : convoInfoOnlineStatus === 'ONLINE'
                    ? 'online'
                    : convoInfoOnlineStatus === 'AWAY'
                    ? lastAwayDate
                    : lastSeenDate
                    ? lastOnlineDate
                    : '...'}
                </Col>
              </Col>
            </Box>
          ) : !convoId ? (
            <Col as='span' className='ml-0 p-0'>
              {placeHolderDisplayName}
            </Col>
          ) : (
            <>
              <Avatar
                component='span'
                className='chat-avatar ml-0'
                alt='Emmanuel Sunday'
                src={`/images/${convoAvatar}`}
              />
              <Col as='span' className='ml-2 p-0'>
                {convoDisplayName ?? placeHolderDisplayName}
              </Col>
            </>
          )}
        </Col>

        <Col as='span' className='controls p-0'>
          <Box component='span' className='control-wrapper ml-1'>
            <IconButton
              className='minimize-button'
              onClick={handleMinimizeChatClick}
              aria-label='minimize chat box'>
              {!isMinimized ? <MinimizeIcon /> : <WebAssetIcon />}
            </IconButton>
          </Box>

          <Box component='span' className='control-wrapper ml-1'>
            <IconButton
              className='close-button'
              onClick={handleCloseChatClick}
              aria-label='close chat box'>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            component='span'
            className='control-wrapper more-options-wrapper ml-1'>
            <IconButton
              className='more-button'
              onClick={toggleMoreOptionsPopover}
              aria-label='more'>
              <MoreVertIcon />
            </IconButton>

            <span
              ref={moreOptionsContainerRef as any}
              className={`more-options-container ${
                moreOptionsContainerIsVisible ? 'show' : 'hide'
              } ${
                isMinimized ? 'transform-upwards' : ''
              } d-inline-flex flex-column p-0`}
              onClick={hideMoreOptionsOnClick}>
              <Button
                variant='contained'
                className='user-info-button'
                onClick={handleUserInfoOptionClick}>
                <PersonIcon /> User Info
              </Button>

              <Button
                variant='contained'
                className='minimize-button'
                onClick={handleMinimizeChatClick}>
                {!isMinimized ? (
                  <>
                    <MinimizeIcon /> Minimize
                  </>
                ) : (
                  <>
                    <WebAssetIcon />
                    Maximize
                  </>
                )}
              </Button>

              <Button
                variant='contained'
                className='close-button'
                onClick={handleCloseChatClick}>
                <CloseIcon /> Close
              </Button>
            </span>
          </Box>
        </Col>
      </Row>

      <Memoize
        memoizedComponent={MiddlePaneHeaderActions}
        numOfSelectedMessages={numOfSelectedMessages}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
        webSocket={socket}
      />
    </>
  );
}

function MiddlePaneHeaderActions(props: {
  numOfSelectedMessages: number;
  selectedMessages: { [key: string]: any };
  setClearSelections: Function;
  setSelectedMessages: Function;
  webSocket: WebSocket;
}) {
  const {
    numOfSelectedMessages,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<any>(
    (choice: ActionChoice) => choice
  );
  const [canDeleteForEveryone, setCanDeleteForEveryone] = useState<boolean>(
    true
  );

  const handleClearSelections = useCallback(() => {
    setClearSelections(true);
    delay(10).then(() => setSelectedMessages({}));
  }, [setClearSelections, setSelectedMessages]);

  const confirmDeleteMessage = useCallback((): Promise<ActionChoice> => {
    return new Promise((resolve) => {
      let canDeleteForEveryone = true;

      for (const id in selectedMessages) {
        if (
          selectedMessages[id].type === 'incoming' ||
          selectedMessages[id].deleted
        ) {
          canDeleteForEveryone = false;
          break;
        }
      }

      setCanDeleteForEveryone(canDeleteForEveryone);
      setDialogAction(() => (choice: ActionChoice) => {
        resolve(choice);
        setOpenConfirmDialog(false);
      });
      setOpenConfirmDialog(true);
    });
  }, [selectedMessages]);

  const handleDeleteMessage = useCallback(() => {
    confirmDeleteMessage().then((choice) => {
      if (choice === 'CANCEL') return;

      const pipe =
        choice === 'DELETE_FOR_EVERYONE'
          ? CHAT_MESSAGE_DELETED
          : CHAT_MESSAGE_DELETED_FOR;

      for (const id in selectedMessages) {
        try {
          if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({ message_id: id, pipe }));
            handleClearSelections();
          } else {
            emitUserOnlineStatus(true, false, {
              open: true,
              message:
                "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can perform action again.",
              severity: 'info',
              autoHide: false
            });
          }
        } catch (e) {
          emitUserOnlineStatus(false, true, {
            open: true,
            message:
              e +
              'An error occurred. Could not establish connection with server.',
            severity: 'error'
          });
          console.error('An error occurred. Error:', e);
        }
      }
    });
  }, [selectedMessages, confirmDeleteMessage, socket, handleClearSelections]);

  return (
    <>
      <Box
        className={`message-actions-wrapper${
          numOfSelectedMessages ? ' visible' : ''
        }`}>
        <Row
          className={`message-actions-container ${
            numOfSelectedMessages ? 'open' : ''
          } m-0`}>
          <Box className='action-wrapper text-left'>
            {
              <>
                <IconButton
                  className='clear-selection-button ml-2'
                  onClick={handleClearSelections}
                  aria-label='cancel action button'>
                  <CloseIcon />
                </IconButton>
                <Col as='span' className='ml-2 px-0'>
                  {numOfSelectedMessages
                    ? `${numOfSelectedMessages} selected`
                    : 'Cleared'}
                </Col>
              </>
            }
          </Box>
          <Box className='action-wrapper text-right'>
            <IconButton
              className='delete-button mr-2'
              onClick={handleDeleteMessage}
              aria-label='delete message'>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Row>
      </Box>

      <Memoize
        memoizedComponent={ConfirmDialog}
        open={openConfirmDialog}
        action={dialogAction}
        canDeleteForEveryone={canDeleteForEveryone}
      />
    </>
  );
}

function ScrollView(props: {
  userId: string;
  convoMessages: APIMessageResponse[];
  convoMessagesStatus: SearchState['status'];
  convoFriendship: string;
  convoAssocUsername: string;
  convoId: string;
  convoDisplayName: string;
  clearSelections: boolean;
  selectedMessages: { [id: string]: SelectedMessageValue };
  setClearSelections: Function;
  setSelectedMessages: Function;
  handleProfileLinkClick: React.MouseEventHandler;
}) {
  const {
    userId,
    convoMessages,
    convoMessagesStatus,
    convoFriendship,
    convoAssocUsername,
    convoId,
    convoDisplayName,
    clearSelections,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    handleProfileLinkClick
  } = props;
  const {
    convoMessagesErr,
    convoMessagesStatusText,
    convoParticipants,
    convoInfoNewMessage
  } = useContext(ScrollViewContext);

  const offset = (convoMessages![0] ?? {}).date;
  const handleScrollViewScroll = useCallback(() => {
    if (scrollView) {
      clearTimeout(loadMessagesTimeout);
      scrollViewScrollPos = scrollView.scrollHeight - scrollView.scrollTop;
      loadMessagesTimeout = setTimeout(() => {
        if (
          scrollView!?.scrollTop <= 100 &&
          !/end/.test(convoMessagesStatusText as string)
        ) {
          dispatch(
            getConversationMessages(
              convoId as string,
              'settled',
              'has offset',
              offset
            )(dispatch)
          );
        }
      }, 500);

      scrollView.classList.remove('scroll-ended');
      clearTimeout(hideScrollBarTimeout);
      hideScrollBarTimeout = setTimeout(() => {
        scrollView!.classList.add('scroll-ended');
      }, 800);
    }
  }, [convoId, offset, convoMessagesStatusText]);

  const handleMessageSelection = useCallback(
    (id: string | null, value: SelectedMessageValue) => {
      setClearSelections(false);
      setSelectedMessages((prev: { [id: string]: SelectedMessageValue }) => {
        const newState: { [key: string]: SelectedMessageValue } = {
          ...prev,
          ...{ [value.id]: value }
        };

        if (!id) {
          delete newState[value.id];
        }

        return newState;
      });
    },
    [setSelectedMessages, setClearSelections]
  );

  useEffect(() => {
    if (!scrollView) scrollView = scrollViewRef.current;

    if (scrollView) {
      scrollView.style.marginBottom = 'calc(21.5px - 1.25rem)';
    }

    //call this on app load to take care of wider screens where messages may not be long enough for a scroll
    if (scrollView && scrollView.scrollHeight <= scrollView.offsetHeight) {
      handleScrollViewScroll();
    }
  }, [handleScrollViewScroll]);

  useEffect(() => {
    if (scrollView) {
      const canAdjustScrollTop =
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 300;
      const canAddScrollPadding =
        scrollView.scrollHeight > scrollView.offsetHeight;

      const scrollPos = scrollView.scrollHeight - scrollViewScrollPos;

      if (
        !convoMessagesStatusText ||
        /new/.test(convoMessagesStatusText as string)
      ) {
        scrollView.scrollTop = scrollView.scrollHeight;
      } else {
        //the code block below implies that if the request for or receipt of (a) new message(s) is not coming from a socket or message hasn't gotten to the very first message of the conversation and the receipt is coming from a request for previous messages (offset) in the conversation, scroll scrollView to the initial scroll position before messages were loaded.
        if (
          /offset/.test(convoMessagesStatusText as string) &&
          convoMessagesStatus === 'fulfilled' &&
          !/end|socket|new/.test(convoMessagesStatusText as string)
        ) {
          scrollView.scrollTop = scrollPos;
        }
      }

      if (canAddScrollPadding && !userDeviceIsMobile) {
        scrollView.classList.add('add-scroll-padding');
      } else {
        scrollView.classList.remove('add-scroll-padding');
      }

      if (
        convoMessages?.length &&
        /settled|fulfilled/.test(convoMessagesStatus as string)
      ) {
        delay(400).then(() => {
          scrollView!.classList.remove('hide-messages');
        });
      } else {
        scrollView.classList.add('hide-messages');
      }

      if (convoMessages && canAdjustScrollTop) {
        // animate (to prevent flicker) if scrollView is at very top else don't animate
        if (scrollView.scrollTop < scrollView.scrollHeight - 300) {
          interval(
            () => {
              scrollView!.scrollTop += 100;
            },
            8,
            () =>
              scrollView!.scrollTop >=
              scrollView!.scrollHeight - scrollView!.offsetHeight - 50
          );
        }
      }
    }
  }, [convoMessages, convoMessagesStatus, convoMessagesStatusText]);

  return (
    <Col
      ref={scrollViewRef as any}
      as='section'
      className={`chat-scroll-view custom-scroll-bar grey-scrollbar`}
      onScroll={handleScrollViewScroll}>
      <Box
        className={`more-messages-loader theme-primary-lighter ${
          convoMessagesStatus === 'settled' &&
          /offset/.test(convoMessagesStatusText as string) &&
          !convoMessagesErr
            ? ''
            : 'hide'
        }`}
        textAlign='center'>
        <CircularProgress thickness={5} color='inherit' size={25} />
      </Box>
      <Box
        className={`pt-4 mb-4 text-center theme-tertiary-lighter ${
          (convoMessagesStatus === 'fulfilled' &&
            /end/.test(convoMessagesStatusText as string)) ||
          (convoMessages?.length && convoMessages?.length < 20)
            ? 'd-block'
            : 'd-none'
        }`}
        fontSize='0.85rem'>
        This is the beginning of your conversation with{' '}
        {convoDisplayName ?? 'your colleague'}.
      </Box>
      {convoMessages?.map((message, key: number) => {
        const { sender_id, date, delivered_to, deleted, seen_by } = message;
        const prevDate = new Date(
          Number(convoMessages![key - 1]?.date)
        ).toDateString();
        const nextDate = new Date(
          Number(convoMessages![key + 1]?.date)
        ).toDateString();
        const selfDate = new Date(Number(message.date)).toDateString();
        const prevAndSelfSentSameDay = prevDate === selfDate;
        const nextAndSelfSentSameDay = nextDate === selfDate;
        const shouldRenderDate = !prevAndSelfSentSameDay;
        const prevDelayed =
          date! - (convoMessages![key - 1]?.date ?? date!) >= 18e5;
        const nextDelayed =
          (convoMessages[key + 1]?.date ?? date!) - date! >= 18e5;

        const type =
          sender_id && sender_id !== userId ? 'incoming' : 'outgoing';
        const prevSenderId = (convoMessages![key - 1] ?? {}).sender_id;
        const nextSenderId = (convoMessages![key + 1] ?? {}).sender_id;
        const isFirstOfStack =
          prevSenderId !== sender_id || !prevAndSelfSentSameDay;
        const isOnlyOfStack =
          (prevSenderId !== sender_id && nextSenderId !== sender_id) ||
          (!nextAndSelfSentSameDay && !prevAndSelfSentSameDay);
        const isMiddleOfStack =
          prevSenderId === sender_id &&
          nextSenderId === sender_id &&
          nextAndSelfSentSameDay &&
          prevAndSelfSentSameDay;
        const isLastOfStack =
          nextSenderId !== sender_id || !nextAndSelfSentSameDay || nextDelayed;
        const className = `${prevDelayed ? 'delayed mt-3' : ''}${
          isFirstOfStack ? ' first' : ''
        }${isOnlyOfStack ? ' only' : ''}${isLastOfStack ? ' last' : ''}${
          isMiddleOfStack ? ' middle' : ''
        }${
          convoInfoNewMessage?._id === message._id || message.timestamp_id
            ? ' last-message'
            : ''
        }`;

        return (
          <React.Fragment key={key}>
            {shouldRenderDate && <ChatDate timestamp={Number(date)} />}
            <Memoize
              memoizedComponent={Message}
              message={message as APIMessageResponse}
              type={type}
              clearSelections={
                message._id! in selectedMessages && clearSelections
                  ? true
                  : false
              }
              forceUpdate={
                String(deleted) + delivered_to?.length + seen_by?.length
              }
              className={className}
              userId={userId}
              participants={convoParticipants}
              canSelectByClick={!!Object.keys(selectedMessages)[0]}
              handleMessageSelection={handleMessageSelection}
            />
          </React.Fragment>
        );
      })}
      {!convoFriendship && convoMessagesStatus === 'fulfilled' && (
        <Box className='text-center py-5 my-2'>
          You are not colleagues with{' '}
          <Box fontWeight='bold'>{convoDisplayName}.</Box>
          <br />
          Send{' '}
          <Link
            className='font-bold'
            onClick={handleProfileLinkClick}
            to={`/@${convoAssocUsername}${window.location.search.replace(
              'open',
              'min'
            )}`}>
            {convoDisplayName?.split(' ')[0]}
          </Link>{' '}
          a colleague request to continue your conversation.
        </Box>
      )}
    </Col>
  );
}

function MessageBox(props: { convoId: string; webSocket: WebSocket }) {
  const { convoId, webSocket: socket } = props;
  const msgBoxInitHeight = 19;

  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const msg = {
      message: msgBox.value.trim(),
      timestamp_id: String(Date.now()),
      pipe: 'CHAT_NEW_MESSAGE',
      date: Date.now(),
      conversation_id: convoId,
      _id: 'ddd'
    } as APIMessageResponse;

    if (!msg.message) {
      setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    try {
      if (socket && socket.readyState === 1) {
        if (scrollView) {
          scrollView.style.marginBottom = `calc(21.5px - 1.25rem)`;
        }

        dispatch(conversationMessages({ data: [{ ...msg }] }));
        msgBox.value = '';
        setMsgBoxRowsMax(1);
        socket.send(JSON.stringify(msg));
      } else {
        emitUserOnlineStatus(true, false, {
          open: true,
          message:
            "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can perform action again.",
          severity: 'info',
          autoHide: false
        });
      }
    } catch (e) {
      emitUserOnlineStatus(false, true, {
        open: true,
        message:
          e + 'An error occurred. Could not establish connection with server.',
        severity: 'error'
      });
    }
  }, [msgBoxRowsMax, convoId, socket]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      const scrollView = scrollViewRef.current!;
      const elevation = e.target.offsetHeight;
      const chatBoxMaxHeight = msgBoxInitHeight * msgBoxRowsMax;
      const remValue = elevation > msgBoxInitHeight * 4 ? 1.25 : 1.25;

      messageDrafts[convoId as string] = e.target.value;

      if (socket && socket.readyState === 1) {
        socket.send(
          JSON.stringify({ conversation_id: convoId, pipe: CHAT_TYPING })
        );
      }

      if (e.key === 'Enter') {
        if (
          (!e.shiftKey && !userDeviceIsMobile) ||
          (e.shiftKey && userDeviceIsMobile)
        ) {
          handleSendMsgClick();

          if (
            scrollView.scrollTop + scrollView.offsetHeight + 50 >=
            scrollView.scrollHeight - 100
          ) {
            delay(0).then(() => {
              scrollView.scrollTop = scrollView.scrollHeight;
            });
          }

          return false;
        }
      }

      if (e.target.scrollHeight > msgBoxInitHeight) {
        setMsgBoxRowsMax(msgBoxRowsMax < 7 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      }

      if (scrollView) {
        scrollView.style.marginBottom = `calc(${
          elevation + 1.5
        }px - ${remValue}rem)`;
      }
      setMsgBoxCurrentHeight(elevation);

      if (
        elevation <= chatBoxMaxHeight + 19 &&
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
          scrollView.scrollHeight - 100
      ) {
        if (elevation > msgBoxCurrentHeight) {
          //makes sure right amount of scrollTop is set when scrollView scroll position is at the very bottom
          delay(0).then(() => {
            scrollView.scrollTop = scrollView.scrollHeight;
          });
        }
      }
    },
    [socket, convoId, msgBoxCurrentHeight, msgBoxRowsMax, handleSendMsgClick]
  );

  return (
    !!convoId && (
      <Col as='section' className={`chat-msg-box p-0`}>
        <Col as='span' className='emoji-wrapper p-0'>
          <IconButton
            className='emoji-button d-none'
            // onClick={toggleDrawer(true)}
            aria-label='insert emoji'>
            <EmojiIcon fontSize='inherit' />
          </IconButton>
        </Col>
        <Col className='msg-box-wrapper p-0'>
          <TextField
            variant='outlined'
            id='msg-box'
            className='msg-box custom-scroll-bar grey-scrollbar'
            placeholder='Type a message...'
            multiline
            rows={1}
            rowsMax={msgBoxRowsMax}
            size='small'
            inputRef={msgBoxRef}
            fullWidth
            inputProps={{
              onKeyDown: handleMsgInputChange,
              onKeyUp: handleMsgInputChange,
              onKeyPress: preventEnterNewLine
            }}
          />
        </Col>
        <Col as='span' className='send-wrapper p-0'>
          <IconButton
            className='send-button'
            onClick={handleSendMsgClick}
            aria-label='send msg'>
            <SendIcon fontSize='inherit' />
          </IconButton>
        </Col>
      </Col>
    )
  );
}

export default ChatMiddlePane;
