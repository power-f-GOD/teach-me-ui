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

import Container from 'react-bootstrap/Container';
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
import FilterNoneRoundedIcon from '@material-ui/icons/FilterNoneRounded';
import ReplyRoundedIcon from '@material-ui/icons/ReplyRounded';

import {
  ChatState,
  APIMessageResponse,
  UserData,
  Partial,
  OnlineStatus,
  SearchStateV2
} from '../../constants/interfaces';
import createMemo from '../../Memo';
import { userDeviceIsMobile } from '../../';
import {
  chatState,
  conversationMessages,
  getConversationMessages,
  conversations,
  conversation,
  conversationsMessages
} from '../../actions/chat';
import {
  dispatch,
  delay,
  interval,
  preventEnterNewLine,
  formatMapDateString,
  timestampFormatter,
  addEventListenerOnce,
  emitUserOnlineStatus,
  promisedDispatch,
  loopThru,
  getState
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import {
  CHAT_TYPING,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELIVERED
} from '../../constants/chat';
import {
  ConfirmDialog,
  Message,
  ChatDate,
  SelectedMessageValue,
  ActionChoice,
  NewMessageBar,
  ChatHead
} from './Chat.crumbs';
import { displaySnackbar } from '../../actions';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

interface ChatMiddlePaneProps {
  userData: UserData;
  chatState: ChatState;
  webSocket: WebSocket;
  search: string;
  chat: string;
  convoFriendship: string;
  convoParticipants: string[];
  convoId: string;
  convoUserTyping: string;
  convoType: string;
  convoDisplayName: string;
  convoProfilePhoto: string;
  convoUsername: string;
  convoUnreadCount: number;
  convoMessages: Partial<APIMessageResponse>[];
  convoMessagesErr: boolean;
  convoMessagesStatus: SearchStateV2<APIMessageResponse>['status'];
  convoMessagesStatusText: string;
  convosErr: boolean;
  convoOnlineStatus: OnlineStatus;
  convoNewMessage: Partial<APIMessageResponse>;
  convoLastSeen: number;
  convoLastReadDate: number;
  activePaneIndex: number;
  setOnlineStatus: Function;
  handleSetActivePaneIndex(index: number): any;
}

export const ScrollViewContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);
export const MiddlePaneHeaderContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);
export const ColleagueNameAndStatusContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);

export const scrollViewRef: any = createRef<HTMLElement | null>();
export const msgBoxRef: any = createRef<HTMLInputElement | null>();
const moreOptionsContainerRef: any = createRef<HTMLElement | any>();
const messageActionsWrapperRef: any = createRef<HTMLInputElement | null>();
const messagesStatusSignalRef: any = createRef<HTMLInputElement | null>();
const headerNameControlWrapperRef: any = createRef<HTMLInputElement | null>();

let scrollView: HTMLElement | null = null;
let msgBox: HTMLInputElement | null = null;
let messageActionsWrapper: HTMLElement | any = null;
let moreOptionsContainer: HTMLElement | any = null;
let messagesStatusSignal: HTMLElement | any = null;
let headerNameControlWrapper: HTMLElement | any = null;

const Memoize = createMemo();

let hideScrollBarTimeout: any;
let loadMessagesTimeout: any;
let scrollViewPrevScrollPos = 0;
let messageDrafts: any = {};

const ChatMiddlePane = (props: Partial<ChatMiddlePaneProps>) => {
  const {
    userData,
    convoDisplayName,
    convoId,
    convoFriendship,
    convoUsername,
    convoOnlineStatus,
    convoMessages: data,
    convoMessagesStatus,
    activePaneIndex,
    webSocket: socket
  } = props;
  const convoMessages = data as Partial<APIMessageResponse>[];
  const { chat, cid } = queryString.parse(window.location.search) ?? {};

  const [selectedMessages, setSelectedMessages] = useState<{
    [id: string]: SelectedMessageValue;
  }>({});
  const [clearSelections, setClearSelections] = useState<boolean>(false);
  const [messageHead, setMessageHead] = useState<SelectedMessageValue | null>(
    null
  );

  const handleProfileLinkClick = useCallback(() => {
    dispatch(
      chatState({
        queryString: window.location.search.replace('o1', 'm2'),
        isMinimized: true
      })
    );
  }, []);

  useEffect(() => {
    messagesStatusSignal = messagesStatusSignalRef.current;

    return () => {
      renderAwayDateTimeout = null;
      _canDisplayAwayDate = false;
      lastSeenForAway = Date.now();
      hideScrollBarTimeout = null;
      loadMessagesTimeout = null;
      scrollViewPrevScrollPos = 0;
      messageDrafts = {};
      scrollView = null;
      msgBox = null;
      messageActionsWrapper = null;
      moreOptionsContainer = null;
      messagesStatusSignal = null;
      headerNameControlWrapper = null;
    };
  }, []);

  useEffect(() => {
    if ((cid || convoId) && msgBoxRef.current) {
      msgBoxRef.current.value = messageDrafts[convoId || cid] ?? '';

      if (!userDeviceIsMobile) {
        msgBoxRef.current.focus();
      }
    }
  }, [convoId, cid]);

  useEffect(() => {
    if (
      +activePaneIndex! > -1 &&
      !!convoMessages[0] &&
      userData?.online_status === 'ONLINE'
    ) {
      const [_isOpen, _isMinimized] = [!!chat, chat === 'm2'];
      const isSameCid = convoId === cid;
      const userId = userData.id;

      if (_isOpen && isSameCid && !_isMinimized) {
        dispatch(conversations({ data: [{ unread_count: 0, id: convoId }] }));
      }

      loopThru(
        convoMessages,
        (convoMessage): any => {
          const message = { ...convoMessage };

          if (!message.sender_id || userId === message.sender_id) {
            return;
          }

          const isSeen = message.seen_by?.includes(userId);

          if (isSeen) {
            return 'break';
          }

          try {
            if (socket && socket.readyState === 1 && isSameCid) {
              if (_isOpen) {
                const isDelivered = message.delivered_to?.includes(userId);

                if (!isDelivered) {
                  socket!.send(
                    JSON.stringify({
                      message_id: message.id,
                      pipe: CHAT_MESSAGE_DELIVERED
                    })
                  );

                  dispatch(
                    conversationMessages({
                      statusText: 'from socket',
                      pipe: CHAT_MESSAGE_DELIVERED,
                      data: [{ delivered_to: [userId], id: message.id }]
                    })
                  );
                }

                if (!_isMinimized) {
                  socket!.send(
                    JSON.stringify({
                      message_id: message.id,
                      pipe: CHAT_READ_RECEIPT
                    })
                  );
                  dispatch(
                    conversationMessages({
                      statusText: 'from socket',
                      pipe: CHAT_READ_RECEIPT,
                      data: [{ seen_by: [userId], id: message.id }]
                    })
                  );
                }
              } else return;
            } else return 'break';
          } catch (e) {
            emitUserOnlineStatus(false, true, {
              open: true,
              message:
                e +
                'An error occurred. Could not establish connection with server.',
              severity: 'error'
            });
            console.error('An error occurred. Error:', e);
            return 'break';
          }
        },
        { rightToLeft: true }
      );
    }
  }, [
    cid,
    convoId,
    chat,
    userData,
    convoMessages,
    convoOnlineStatus,
    activePaneIndex,
    socket
  ]);

  return (
    <>
      <Col as='header' className='chat-header d-flex p-0'>
        <Memoize
          memoizedComponent={MiddlePaneHeader}
          convoId={convoId}
          convoOnlineStatus={convoOnlineStatus}
          setMessageHead={setMessageHead}
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
        convoUsername={convoUsername}
        convoId={convoId}
        convoDisplayName={convoDisplayName}
        username={userData?.username as string}
        userId={userData?.id as string}
        clearSelections={clearSelections}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
        handleProfileLinkClick={handleProfileLinkClick}
      />
      <Box className='scroll-bar-fader' />

      <Container
        fluid
        className='theme-tertiary d-flex align-items-center justify-content-center messages-status-signal h-100'
        ref={messagesStatusSignalRef}>
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
                  className='font-bold theme-secondary-lighter'
                  onClick={handleProfileLinkClick}
                  to={`/@${convoUsername}${window.location.search.replace(
                    'o1',
                    'm2'
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
            Start a Conversation
          </Box>
        )}
      </Container>

      {convoId && (
        <Memoize
          memoizedComponent={MessageBox}
          convoId={convoId}
          messageHead={messageHead}
          webSocket={socket}
          setMessageHead={setMessageHead}
        />
      )}
    </>
  );
};

function MiddlePaneHeader(props: {
  convoId: string;
  convoOnlineStatus: OnlineStatus;
  setMessageHead: Function;
  setSelectedMessages: Function;
  setClearSelections: Function;
  selectedMessages: { [key: string]: any };
  webSocket: WebSocket;
}) {
  const {
    convoId,
    convoOnlineStatus,
    setMessageHead,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const { chatState: _chatState, handleSetActivePaneIndex } = useContext(
    MiddlePaneHeaderContext
  );
  const { isMinimized, isOpen } = _chatState as ChatState;

  const numOfSelectedMessages = Object.keys(selectedMessages).length;

  const [moreOptionsContainerIsVisible, setMoreOptionsIsVisible] = useState<
    boolean
  >(false);

  const handleMinimizeChatClick = useCallback(
    (shouldActuallyMinimize?: any) => {
      const { isMinimized, queryString: qString } = _chatState as ChatState;
      let queryString = qString!.replace(
        isMinimized ? 'chat=m2' : 'chat=o1',
        isMinimized ? 'chat=o1' : 'chat=m2'
      );

      queryString = shouldActuallyMinimize
        ? queryString
        : queryString.replace('=o1', '=m2');

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
    if (!isOpen) {
      return;
    }

    //store/save updated convoMessages in state before close
    if (convoId) {
      dispatch(
        conversationsMessages({
          convoId,
          statusText: 'replace messages',
          data: { [convoId]: [...getState().conversationMessages.data] }
        })
      );
    }

    dispatch(conversation(''));
    dispatch(conversationMessages({ data: [] }));
    clearTimeout(clickTimeout.current);
    clickTimeout.current = window.setTimeout(() => {
      dispatch(
        chatState({
          isMinimized: false,
          isOpen: false,
          queryString: ''
        })
      );
      window.history.replaceState({}, '', window.location.pathname);
    }, 500);
  }, [isOpen, convoId]);

  const handleUserInfoOptionClick = useCallback(() => {
    handleMinimizeChatClick(false);
    delay(isMinimized ? 1100 : 350).then(() => {
      handleSetActivePaneIndex!(2)();
    });
  }, [isMinimized, handleMinimizeChatClick, handleSetActivePaneIndex]);

  const toggleMoreOptionsPopover = useCallback(() => {
    setMoreOptionsIsVisible((prev) => !prev);
  }, []);

  const handleConversationsMenuClick = useCallback(() => {
    handleMinimizeChatClick(false);
    delay(isMinimized ? 1100 : 350).then(() => {
      handleSetActivePaneIndex!(0)();
      promisedDispatch(
        conversations({ data: [{ id: convoId, unread_count: 0 }] })
      ).then(() => {
        dispatch(conversation(convoId));
      });
    });
  }, [isMinimized, convoId, handleMinimizeChatClick, handleSetActivePaneIndex]);

  const hideMoreOptionsOnClick = useCallback(() => {
    setMoreOptionsIsVisible(false);
  }, []);

  useEffect(() => {
    moreOptionsContainer = moreOptionsContainerRef.current;
    headerNameControlWrapper = headerNameControlWrapperRef.current;

    if (moreOptionsContainer) {
      moreOptionsContainer.inert = true;
    }
  }, []);

  useEffect(() => {
    if (moreOptionsContainer) {
      addEventListenerOnce(moreOptionsContainer, () => {
        moreOptionsContainer.inert = !moreOptionsContainerIsVisible;
      });
    }
  }, [moreOptionsContainerIsVisible]);

  useEffect(() => {
    if (headerNameControlWrapper) {
      headerNameControlWrapper.inert = !!numOfSelectedMessages;
    }
  }, [numOfSelectedMessages]);

  return (
    <>
      <Row
        className={`chat-header-name_control-wrapper ${
          convoId ? '' : 'chat-bg'
        } px-2 mx-0`}
        ref={headerNameControlWrapperRef}>
        <Memoize
          memoizedComponent={MiddlePandeHeaderConversationNameAndStatus}
          convoOnlineStatus={convoOnlineStatus}
          handleConversationsMenuClick={handleConversationsMenuClick}
          handleUserInfoOptionClick={handleUserInfoOptionClick}
        />

        <Col as='span' className='chat-header-controls p-0'>
          <Box component='span' className='chat-header-control-wrapper ml-1'>
            <IconButton
              className='minimize-button'
              onClick={handleMinimizeChatClick}
              aria-label='minimize chat box'>
              {!isMinimized ? <MinimizeIcon /> : <WebAssetIcon />}
            </IconButton>
          </Box>

          <Box component='span' className='chat-header-control-wrapper ml-1'>
            <IconButton
              className='close-button'
              onClick={handleCloseChatClick}
              aria-label='close chat box'>
              <CloseIcon />
            </IconButton>
          </Box>

          <ClickAwayListener
            onClickAway={() =>
              moreOptionsContainerIsVisible ? toggleMoreOptionsPopover() : null
            }>
            <Box
              component='span'
              className='chat-header-control-wrapper more-options-wrapper ml-1'>
              <IconButton
                className='more-button'
                onClick={toggleMoreOptionsPopover}
                aria-label='more'>
                <MoreVertIcon />
              </IconButton>

              <Container
                as='span'
                ref={moreOptionsContainerRef}
                className={`chat-more-options-container ${
                  moreOptionsContainerIsVisible ? 'show' : 'hide'
                } ${
                  isMinimized ? 'transform-upwards' : ''
                } d-inline-flex flex-column p-0 w-auto`}
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
              </Container>
            </Box>
          </ClickAwayListener>
        </Col>
      </Row>

      <Memoize
        memoizedComponent={MiddlePaneHeaderActions}
        inert={!numOfSelectedMessages}
        numOfSelectedMessages={numOfSelectedMessages}
        setMessageHead={setMessageHead}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
        webSocket={socket}
      />
    </>
  );
}

let renderAwayDateTimeout: any;
let _canDisplayAwayDate = false;
let lastSeenForAway = Date.now();

function MiddlePandeHeaderConversationNameAndStatus(props: {
  convoOnlineStatus: OnlineStatus;
  handleConversationsMenuClick: React.MouseEventHandler;
  handleUserInfoOptionClick: React.MouseEventHandler;
}) {
  const {
    convoOnlineStatus,
    handleConversationsMenuClick,
    handleUserInfoOptionClick
  } = props;
  const {
    convoId,
    convoDisplayName,
    convoProfilePhoto,
    convosErr,
    convoType,
    convoUserTyping,
    convoLastSeen,
    setOnlineStatus
  } = useContext(ColleagueNameAndStatusContext);
  const [canDisplayAwayDate, setCanDisplayAwayDate] = useState(false);
  const [lastSeenDate, lastSeenTime] = [
    formatMapDateString(convoLastSeen as number),
    timestampFormatter(convoLastSeen)
  ];
  const lastAwayDate = `away ${
    canDisplayAwayDate ? 'since ' + lastSeenTime + ', ' + lastSeenDate : ''
  }`;
  const lastOnlineDate = `last seen ${lastSeenDate} at ${lastSeenTime.replace(
    ' ',
    ''
  )}`;
  const onlineStatus = convoUserTyping
    ? 'typing...'
    : convoOnlineStatus === 'ONLINE'
    ? 'online'
    : convoOnlineStatus === 'AWAY'
    ? lastAwayDate
    : lastSeenDate
    ? lastOnlineDate
    : '...';

  const displayAwayDate = useCallback(() => {
    renderAwayDateTimeout = setTimeout(() => {
      _canDisplayAwayDate = Date.now() - lastSeenForAway > 300000;

      if (!_canDisplayAwayDate) {
        clearTimeout(renderAwayDateTimeout);
        displayAwayDate();
      }

      if (_canDisplayAwayDate || !lastSeenForAway) {
        clearTimeout(renderAwayDateTimeout);
        setCanDisplayAwayDate(true);
      }
    }, 10000);

    if ((_canDisplayAwayDate = Date.now() - lastSeenForAway > 300000)) {
      clearTimeout(renderAwayDateTimeout);
      setCanDisplayAwayDate(true);
    }
  }, []);

  useEffect(() => {
    setOnlineStatus!(onlineStatus);
  }, [onlineStatus, setOnlineStatus]);

  useEffect(() => {
    lastSeenForAway = convoLastSeen as number;
    displayAwayDate();

    if (convoId && convoOnlineStatus !== 'AWAY') {
      clearTimeout(renderAwayDateTimeout);
      setCanDisplayAwayDate(false);
    }

    return () => {
      renderAwayDateTimeout = null;
      _canDisplayAwayDate = false;
      lastSeenForAway = Date.now();
    };
  }, [convoId, convoOnlineStatus, convoLastSeen, displayAwayDate]);

  return (
    <Col as='span' className='chat-conversation-name-wrapper'>
      <Box
        component='span'
        className='chat-header-control-wrapper conversations-menu-button-wrapper'>
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
          className='conversation-name-container d-inline-flex align-items-center'
          onClick={handleUserInfoOptionClick}>
          <Badge
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            className={`online-badge ${
              !convosErr ? convoOnlineStatus?.toLowerCase() : 'offline'
            }`}
            overlap='circle'
            variant='dot'>
            <Avatar
              component='span'
              className='chat-avatar'
              alt={convoDisplayName}
              src={convoProfilePhoto}
            />
          </Badge>{' '}
          <Col as='span' className='ml-2 p-0'>
            <Col
              as='span'
              className={`display-name ${
                !convoLastSeen || convosErr ? 'status-hidden' : ''
              } p-0`}>
              {convoDisplayName ?? placeHolderDisplayName}
            </Col>
            <Col
              as='span'
              className={`status ${convoLastSeen && !convosErr ? 'show' : ''} ${
                /typing/.test(onlineStatus) ? 'font-bold' : ''
              } p-0`}>
              {onlineStatus}
            </Col>
          </Col>
        </Box>
      ) : !convoId ? (
        <Col as='span' className='theme-tertiary-darker ml-2 p-0'>
          {placeHolderDisplayName}...
        </Col>
      ) : (
        <>
          <Avatar
            component='span'
            className='chat-avatar ml-0'
            alt='Emmanuel Sunday'
            src={`/images/${convoProfilePhoto}`}
          />
          <Col as='span' className='ml-2 p-0'>
            {convoDisplayName ?? placeHolderDisplayName}
          </Col>
        </>
      )}
    </Col>
  );
}

function MiddlePaneHeaderActions(props: {
  inert: boolean;
  numOfSelectedMessages: number;
  setMessageHead: Function;
  selectedMessages: { [key: string]: SelectedMessageValue };
  setClearSelections: Function;
  setSelectedMessages: Function;
  webSocket: WebSocket;
}) {
  const {
    inert,
    numOfSelectedMessages,
    setMessageHead,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const oneSelected = numOfSelectedMessages === 1;

  const [canShowReplyButton, setCanShowReplyButton] = useState<boolean>(
    oneSelected
  );
  const [
    messageToReply,
    setMessageToReply
  ] = useState<APIMessageResponse | null>(null);
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

  const handleReplyMessage = useCallback(() => {
    if (oneSelected && messageToReply) {
      msgBox?.focus();
      handleClearSelections();
      setMessageHead(messageToReply.deleted ? null : { ...messageToReply });
    }
  }, [oneSelected, messageToReply, setMessageHead, handleClearSelections]);

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

  const handleCopyMessage = useCallback(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    const container = document.createElement('div');
    const isMulti = numOfSelectedMessages > 1;
    let messages = '';

    for (const id in selectedMessages) {
      const { message, date: _date, sender_username } = selectedMessages[id];
      const [date, time] = [
        new Date(_date).toLocaleDateString(),
        timestampFormatter(_date)
      ];

      if (!message) {
        if (!isMulti) return;
        continue;
      }

      if (isMulti) {
        messages +=
          `[@${sender_username} | ${date} at ${time}]:\n` + message + '\n\n';
      } else {
        messages = message;
      }
    }

    container.className = 'chat-message-selection-data-container';
    container.textContent = messages;
    document.body.appendChild(container);
    range.selectNodeContents(container);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(container);
    handleClearSelections();
    dispatch(
      displaySnackbar({
        message: `Message${isMulti ? 's' : ''} copied to clipboard.`,
        severity: 'info',
        open: true,
        autoHide: true,
        timeout: 1600
      })
    );
  }, [selectedMessages, numOfSelectedMessages, handleClearSelections]);

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
                "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again.",
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

  useEffect(() => {
    if (oneSelected) {
      const message = selectedMessages[Object.keys(selectedMessages)[0]];

      setCanShowReplyButton(!message.deleted);
      setMessageToReply(message);
    } else {
      setCanShowReplyButton(false);
    }

    addEventListenerOnce(
      window,
      (e: any) => {
        if (numOfSelectedMessages) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            handleCopyMessage();
          }

          if (((e.ctrlKey || e.metaKey) && e.key === 'd') || e.keyCode === 46) {
            e.preventDefault();
            handleDeleteMessage();
          }

          if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleReplyMessage();
          }
        }
      },
      'keyup'
    );
  }, [
    oneSelected,
    numOfSelectedMessages,
    setMessageHead,
    selectedMessages,
    handleReplyMessage,
    handleCopyMessage,
    handleDeleteMessage
  ]);

  useEffect(() => {
    if (messageActionsWrapper) {
      messageActionsWrapper.inert = inert;
    }
  }, [inert]);

  useEffect(() => {
    messageActionsWrapper = messageActionsWrapperRef.current;

    if (messageActionsWrapper) {
      messageActionsWrapper.inert = true;
    }
  }, []);

  return (
    <>
      <Container
        fluid
        className='chat-message-actions-wrapper'
        ref={messageActionsWrapperRef}>
        <Row
          className={`chat-message-actions-container ${
            numOfSelectedMessages ? 'open' : ''
          } m-0`}>
          <Box className='chat-action-wrapper text-left'>
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
          </Box>
          <Box className='d-flex'>
            <Box
              className={`chat-action-wrapper ${
                canShowReplyButton ? 'scale-up' : 'scale-down'
              }-forwards text-right`}>
              <IconButton
                className='reply-button mr-1'
                onClick={handleReplyMessage}
                aria-label='reply message'
                tabIndex={canShowReplyButton ? 0 : -1}
                aria-hidden={!canShowReplyButton}>
                <ReplyRoundedIcon />
              </IconButton>
            </Box>
            <Box className='chat-action-wrapper text-right'>
              <IconButton
                className='copy-button mr-1'
                onClick={handleCopyMessage}
                aria-label='copy message'>
                <FilterNoneRoundedIcon />
              </IconButton>
            </Box>
            <Box className='chat-action-wrapper text-right'>
              <IconButton
                className='delete-button mr-2'
                onClick={handleDeleteMessage}
                aria-label='delete message'>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Row>
      </Container>

      <Memoize
        memoizedComponent={ConfirmDialog}
        open={openConfirmDialog}
        action={dialogAction}
        numOfSelectedMessages={numOfSelectedMessages}
        canDeleteForEveryone={canDeleteForEveryone}
      />
    </>
  );
}

export const chatDateStickyRef: any = createRef<HTMLInputElement | null>();
let newMessageCount = 0;

function ScrollView(props: {
  userId: string;
  username: string;
  convoMessages: APIMessageResponse[];
  convoMessagesStatus: SearchStateV2<APIMessageResponse>['status'];
  convoFriendship: string;
  convoUsername: string;
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
    username,
    convoMessages,
    convoMessagesStatus,
    convoFriendship,
    convoUsername,
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
    convoNewMessage,
    convoUnreadCount,
    convoLastReadDate
  } = useContext(ScrollViewContext);

  const [hasReachedTopOfConvo, setHasReachedTopOfConvo] = useState(false);

  const offset = (convoMessages![0] ?? {}).date;
  const handleScrollViewScroll = useCallback(() => {
    if (scrollView && convoId) {
      clearTimeout(loadMessagesTimeout);

      loadMessagesTimeout = setTimeout(() => {
        scrollViewPrevScrollPos =
          scrollView!.scrollHeight - scrollView!.scrollTop;

        if (
          scrollView!?.scrollTop <= 200 &&
          !/end/.test(convoMessagesStatusText as string) &&
          scrollView?.querySelector('.chat-msg-container')
        ) {
          dispatch(
            getConversationMessages(
              convoId as string,
              'settled',
              'has offset',
              offset
            )(dispatch)
          );
          setHasReachedTopOfConvo(false);
        }
      }, 350);

      scrollView.classList.remove('scroll-ended');
      clearTimeout(hideScrollBarTimeout);
      hideScrollBarTimeout = setTimeout(() => {
        scrollView!.classList.add('scroll-ended');
      }, 400);
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
    if (convoId) {
      setHasReachedTopOfConvo(false);
      newMessageCount = 0;
    }

    return () => {
      newMessageCount = 0;
    };
  }, [convoId]);

  useEffect(() => {
    if (!scrollView) {
      scrollView = scrollViewRef.current;
    }

    if (scrollView) {
      scrollView.style.marginBottom = 'calc(21.5px - 1.25rem)';
    }
  }, []);

  useEffect(() => {
    //call this on app load to take care of wider screens where messages may not be long enough for a scroll
    if (
      scrollView &&
      scrollView.scrollHeight <= scrollView.offsetHeight &&
      convoMessagesStatus === 'fulfilled' &&
      !/end|socket/.test(convoMessagesStatusText as string)
    ) {
      handleScrollViewScroll();
    }

    if (/end/.test(convoMessagesStatusText as string)) {
      setHasReachedTopOfConvo(true);
    }
  }, [convoMessagesStatus, convoMessagesStatusText, handleScrollViewScroll]);

  useEffect(() => {
    if (scrollView) {
      const canAdjustScrollTop =
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 300;
      const canAddScrollPadding =
        scrollView.scrollHeight > scrollView.offsetHeight;
      const scrollViewNewSrollPos =
        scrollView.scrollHeight - scrollViewPrevScrollPos;

      if (
        !convoMessagesStatusText ||
        /new/i.test(convoMessagesStatusText as string)
      ) {
        scrollView!.scrollTop += scrollView!.scrollHeight + 100;
      } else {
        //the code block below implies that if the request for or receipt of (a) new message(s) is not coming from a socket or message hasn't gotten to the very first message of the conversation and the receipt is coming from a request for previous messages (offset) in the conversation, scroll scrollView to the initial scroll position before messages were loaded.
        if (
          /offset/.test(convoMessagesStatusText as string) &&
          convoMessagesStatus === 'fulfilled' &&
          !/end|socket|new/.test(convoMessagesStatusText as string)
        ) {
          scrollView.scrollTop = scrollViewNewSrollPos;
        }
      }

      if (canAddScrollPadding && !userDeviceIsMobile) {
        scrollView.classList.add('add-scroll-padding');
      } else {
        scrollView.classList.remove('add-scroll-padding');
      }

      if (/settled|fulfilled/.test(convoMessagesStatus as string)) {
        if (convoMessages?.length) {
          (messagesStatusSignal ?? {}).inert = true;
          scrollView!.classList.remove('show-status-signal');
        } else {
          (messagesStatusSignal ?? {}).inert = false;
          scrollView.classList.add('show-status-signal');
        }
      }

      if (convoMessages && canAdjustScrollTop) {
        // animate (to prevent flicker) if scrollView is at very top else don't animate
        if (
          scrollView.scrollTop < scrollView.scrollHeight - 300 &&
          scrollView.scrollTop > 100
        ) {
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

  newMessageCount = +convoUnreadCount!;

  return (
    <Col
      ref={scrollViewRef}
      as='section'
      className={`chat-scroll-view custom-scroll-bar grey-scrollbar`}
      onScroll={handleScrollViewScroll}>
      <Box
        id='chat-date-sticky'
        className={`chat-date-wrapper text-center ${
          convoMessages.length ? 'show' : 'hide'
        }`}>
        <Container
          as='span'
          className='chat-date d-inline-block w-auto'
          ref={chatDateStickyRef}></Container>
      </Box>

      <Box
        className={`more-messages-loader theme-tertiary-darker mt-auto ${
          convoMessagesStatus === 'settled' &&
          /offset/.test(convoMessagesStatusText as string) &&
          !convoMessagesErr
            ? ''
            : 'hide'
        }`}
        textAlign='center'>
        <CircularProgress thickness={4} color='inherit' size={28} />
      </Box>
      <Memoize
        memoizedComponent={NewMessageBar}
        type='sticky'
        convoUnreadCount={+convoUnreadCount!}
        scrollView={scrollView as HTMLElement}
        shouldRender={
          !!convoUnreadCount &&
          convoUnreadCount !== convoMessages.length &&
          convoMessages.length >= 20
        }
        className={convoId && convoUnreadCount ? '' : 'd-none'}
      />

      <Box
        className={`the-beginning text-center theme-tertiary ${
          convoMessagesStatus === 'fulfilled' && hasReachedTopOfConvo
            ? 'd-block'
            : 'd-none'
        }`}
        fontSize='0.85rem'>
        This is the beginning of your conversation with <br />
        <b className='font-bold'>{convoDisplayName ?? 'your colleague'}</b>.
      </Box>

      {convoMessages?.map((message, key: number) => {
        const {
          sender_id,
          date,
          delivered_to,
          deleted,
          seen_by,
          id: _id,
          timestamp_id,
          parent: head
        } = message;
        const type =
          sender_id && sender_id !== userId ? 'incoming' : 'outgoing';
        const [prevMessage, nextMessage] = [
          convoMessages![key - 1],
          convoMessages![key + 1]
        ];

        const lastRead = +convoLastReadDate!;
        const willRenderNewMessageBar =
          date > lastRead &&
          ((prevMessage?.date <= lastRead &&
            !!convoUnreadCount &&
            prevMessage?.date) ||
            (!!convoUnreadCount &&
              key === 0 &&
              convoUnreadCount === convoMessages.length));

        const prevDate = new Date(Number(prevMessage?.date)).toDateString();
        const nextDate = new Date(Number(nextMessage?.date)).toDateString();
        const selfDate = new Date(Number(date)).toDateString();

        const prevAndSelfSentSameDay = prevDate === selfDate;
        const nextAndSelfSentSameDay = nextDate === selfDate;
        const prevDelayed = date! - (prevMessage?.date ?? date!) >= 18e5;
        const nextDelayed = (nextMessage?.date ?? date!) - date! >= 18e5;

        const prevSenderId = (prevMessage ?? {}).sender_id;
        const nextSenderId = (nextMessage ?? {}).sender_id;

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

        const shouldRenderDate =
          !prevAndSelfSentSameDay && convoUnreadCount !== convoMessages.length;
        const className = `${prevDelayed ? 'delayed mt-3' : ''} ${
          isFirstOfStack ? 'first' : ''
        } ${isOnlyOfStack ? 'only' : ''} ${isLastOfStack ? 'last' : ''} ${
          isMiddleOfStack ? 'middle' : ''
        } ${convoNewMessage?.id === _id || timestamp_id ? '' : ''}`;

        if (willRenderNewMessageBar) {
          newMessageCount = 0;
          newMessageCount = convoMessages
            .slice(key)
            .reduce((a, b) => (b.sender_id !== userId ? a + 1 : a), 0);
        }

        return (
          <React.Fragment key={key}>
            {shouldRenderDate && (
              <Memoize
                memoizedComponent={ChatDate}
                scrollView={scrollView as HTMLElement}
                timestamp={Number(date)}
              />
            )}
            <Memoize
              memoizedComponent={NewMessageBar}
              type='relative'
              convoUnreadCount={+newMessageCount}
              scrollView={scrollView as HTMLElement}
              shouldRender={willRenderNewMessageBar}
            />
            <Memoize
              memoizedComponent={Message}
              message={message as APIMessageResponse}
              type={type}
              sender_username={type === 'incoming' ? convoUsername : username}
              headSenderUsername={
                head?.sender_id === userId ? username : convoUsername
              }
              clearSelections={
                _id! in selectedMessages && clearSelections ? true : false
              }
              forceUpdate={
                String(deleted) + delivered_to?.length + seen_by?.length
              }
              className={className}
              userId={userId}
              participants={convoParticipants}
              scrollView={scrollView as HTMLElement}
              canSelectByClick={!!Object.keys(selectedMessages)[0]}
              handleMessageSelection={handleMessageSelection}
            />
          </React.Fragment>
        );
      })}
      {!convoFriendship && convoId && (
        <Box className='text-center py-5 px-3 my-2'>
          You are not colleagues with{' '}
          <Box fontWeight='bold'>{convoDisplayName}.</Box>
          <br />
          Send{' '}
          <Link
            className='font-bold'
            onClick={handleProfileLinkClick}
            to={`/@${convoUsername}${window.location.search.replace(
              'o1',
              'm2'
            )}`}>
            {convoDisplayName?.split(' ')[0]}
          </Link>{' '}
          a colleague request to continue your conversation.
        </Box>
      )}
    </Col>
  );
}

let messageHeadCopy: SelectedMessageValue | null = null;

function MessageBox(props: {
  convoId: string;
  messageHead: SelectedMessageValue | null;
  webSocket: WebSocket;
  setMessageHead: Function;
}) {
  const { convoId, webSocket: socket, messageHead, setMessageHead } = props;
  const msgBoxInitHeight = 19;

  const chatHeadWrapperRef: any = useRef<HTMLElement | null>();
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const msg = {
      message: msgBox.value.trim(),
      timestamp_id: String(Date.now()),
      pipe: 'CHAT_NEW_MESSAGE',
      date: Date.now(),
      conversation_id: convoId,
      id: 'ddd'
    } as APIMessageResponse;

    msgBox.focus();

    if (!msg.message) {
      setMsgBoxRowsMax(msgBoxRowsMax < 5 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    try {
      const online = navigator.onLine;

      if (online && socket && socket.readyState === 1) {
        if (messageHead) {
          setMessageHead(null);
        }

        dispatch(
          conversationMessages({
            data: [
              {
                ...msg,
                parent: (messageHead ? { ...messageHead } : null) as any
              }
            ]
          })
        );
        msgBox.value = '';
        setMsgBoxRowsMax(1);
        delete messageDrafts[convoId];
        socket.send(JSON.stringify({ ...msg, parent: messageHead?.id }));
        dispatch(conversation(convoId, { unread_count: 0 }));
        delay(50).then(() => {
          scrollView!.scrollTop = scrollView!.scrollHeight;
        });
      } else {
        emitUserOnlineStatus(online, !online, {
          open: true,
          message: online
            ? "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again."
            : null,
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
  }, [messageHead, setMessageHead, msgBoxRowsMax, convoId, socket]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      const value = e.target.value.trim();
      const scrollView = scrollViewRef.current!;

      messageDrafts[convoId as string] = value;

      if (
        socket &&
        socket.readyState === 1 &&
        !/Tab|Arrow|Shift|Meta|Control|Alt/i.test(e?.key) &&
        !e.ctrlKey &&
        !e.metaKey &&
        value
      ) {
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
          return false;
        }
      }

      if (e.target.scrollHeight > msgBoxInitHeight) {
        setMsgBoxRowsMax(msgBoxRowsMax < 7 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      }

      if (
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 100
      ) {
        delay(0).then(() => {
          scrollView.scrollTop = scrollView.scrollHeight;
        });
      }
    },
    [socket, convoId, msgBoxRowsMax, handleSendMsgClick]
  );

  useEffect(() => {
    const chatHeadWrapper = chatHeadWrapperRef.current as HTMLElement;

    if (chatHeadWrapper) {
      const chatHead = chatHeadWrapper.querySelector(
        '.chat-head'
      ) as HTMLElement;

      chatHeadWrapper.style.height = `${
        messageHead ? chatHead.offsetHeight + 4 : 0
      }px`;

      delay(350).then(() => {
        messageHeadCopy = (messageHead ? { ...messageHead } : null) as any;
      });
    }

    if (!msgBox) {
      msgBox = msgBoxRef.current!;
    }
  }, [messageHead]);

  useEffect(() => {
    if (convoId) {
      setMessageHead(null);
    }

    return () => {
      messageHeadCopy = null;
    };
  }, [convoId, setMessageHead]);

  return (
    <Col
      as='section'
      className={`chat-msg-box ${messageHead ? 'open-reply' : ''} px-0`}>
      <Container className='chat-head-wrapper p-0 m-0' ref={chatHeadWrapperRef}>
        <ChatHead
          type='reply'
          head={messageHead}
          headCopy={messageHeadCopy}
          setMessageHead={setMessageHead}
        />
      </Container>
      <Container className='d-flex p-0'>
        <Col as='span' className='chat-emoji-wrapper p-0'>
          <IconButton
            className='emoji-button d-none'
            // onClick={toggleDrawer(true)}
            aria-label='insert emoji'>
            <EmojiIcon fontSize='inherit' />
          </IconButton>
        </Col>
        <Col className='chat-msg-textfield-wrapper p-0'>
          <TextField
            variant='outlined'
            id='chat-msg-textfield'
            className='chat-msg-textfield custom-scroll-bar grey-scrollbar'
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
              onKeyPress: preventEnterNewLine,
              onInput: handleMsgInputChange
            }}
          />
        </Col>
        <Col as='span' className='chat-send-wrapper p-0'>
          <IconButton
            className='send-button'
            onClick={handleSendMsgClick}
            aria-label='send msg'>
            <SendIcon fontSize='inherit' />
          </IconButton>
        </Col>
      </Container>
    </Col>
  );
}

export default ChatMiddlePane;
