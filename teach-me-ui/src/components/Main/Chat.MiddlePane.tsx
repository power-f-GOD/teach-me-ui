import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  APIConversationResponse,
  UserData,
  ConversationInfo,
  SearchState,
  Partial
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
  timestampFormatter
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import { displaySnackbar, initWebSocket } from '../../actions';
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

interface ChatMiddlePaneProps {
  conversation: APIConversationResponse;
  conversationMessages: SearchState;
  userData: UserData;
  chatState: ChatState;
  conversationInfo: ConversationInfo;
  webSocket: WebSocket;
  handleSetActivePaneIndex(index: number): any;
}

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

const ChatMiddlePane = (props: ChatMiddlePaneProps) => {
  const {
    conversation,
    conversationMessages: _conversationMessages,
    chatState: _chatState,
    userData,
    conversationInfo: _conversationInfo,
    webSocket: socket,
    handleSetActivePaneIndex
  } = props;
  const convoMessages = _conversationMessages.data as Partial<
    APIMessageResponse
  >[];
  const { status, statusText, err } = _conversationMessages;
  const { online_status, data } = _conversationInfo;
  const [lastSeenDate, lastSeenTime] = [
    formatMapDateString(data?.last_seen as number),
    timestampFormatter(data?.last_seen)
  ];
  const {
    _id: convoId,
    type,
    avatar,
    conversation_name: displayName
  } = conversation;
  const { chat, cid } = queryString.parse(window.location.search) ?? {};
  const { isMinimized, isOpen }: ChatState = _chatState;
  const msgBoxInitHeight = 19;
// console.log('MiddlePane renders')
  const scrollViewRef = useRef<HTMLElement | null>(null);
  const msgBoxRef = useRef<HTMLInputElement | null>(null);

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = useState<string>(
    'calc(21.5px - 1.25rem)'
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [selectedMessages, setSelectedMessages] = useState<{
    [id: string]: SelectedMessageValue;
  }>({});
  const [clearSelections, setClearSelections] = useState<boolean>(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<any>(
    (choice: ActionChoice) => choice
  );
  const [canDeleteForEveryone, setCanDeleteForEveryone] = useState<boolean>(
    true
  );
  const [moreOptionsIsVisible, setMoreOptionsIsVisible] = useState<boolean>(
    false
  );

  const numOfSelectedMessages = Object.keys(selectedMessages).length;
  const canDisplayAwayDate = _canDisplayAwayDate;
  const lastAwayDate = `away ${
    canDisplayAwayDate ? 'since ' + lastSeenTime + ', ' + lastSeenDate : ''
  }`;
  const lastOnlineDate = `last seen ${lastSeenDate} at ${lastSeenTime.replace(
    ' ',
    ''
  )}`;

  const displayConnectInfoThenReconnect = useCallback(() => {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: false,
        severity: 'info',
        message:
          "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can perform action again."
      })
    );
    dispatch(initWebSocket(userData.token as string));
  }, [userData.token]);

  const displaySocketErrInfo = useCallback((e: any) => {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: false,
        severity: 'error',
        message:
          'An error occurred. Could not establish connection with server.'
      })
    );
    console.error('An error occurred. Error:', e);
  }, []);

  const toggleMoreOptionsPopover = useCallback(() => {
    setMoreOptionsIsVisible((prev) => !prev);
  }, []);

  const handleConversationsMenuClick = useCallback(() => {
    const queryString = window.location.search.replace('chat=open', 'chat=min');

    if (isMinimized) {
      dispatch(chatState({ isMinimized: false }));
    }

    delay(isMinimized ? 500 : 1).then(() => {
      handleSetActivePaneIndex(0)();
    });

    if (convoId || isNaN(cid)) {
      dispatch(
        chatState({
          isOpen: true,
          queryString
        })
      );
      window.history.replaceState(
        {},
        '',
        window.location.pathname + queryString
      );
    }
  }, [convoId, cid, isMinimized, handleSetActivePaneIndex]);

  const handleUserInfoOptionClick = useCallback(() => {
    if (isMinimized) {
      const queryString = window.location.search.replace(
        'chat=open',
        'chat=min'
      );

      dispatch(chatState({ isMinimized: false, queryString }));
      window.history.replaceState(
        {},
        '',
        window.location.pathname + queryString
      );
    }

    delay(isMinimized ? 500 : 250).then(() => {
      handleSetActivePaneIndex(2)();
    });
  }, [isMinimized, handleSetActivePaneIndex]);

  const hideMoreOptionsOnClick = useCallback(() => {
    setMoreOptionsIsVisible(false);
  }, []);

  const handleProfileLinkClick = useCallback(() => {
    dispatch(
      chatState({
        queryString: window.location.search.replace('open', 'min'),
        isMinimized: true
      })
    );
  }, []);

  const handleMinimizeChatClick = useCallback(() => {
    const { isMinimized, queryString: qString }: ChatState = _chatState;
    const queryString = qString!.replace(
      isMinimized ? 'chat=min' : 'chat=open',
      isMinimized ? 'chat=open' : 'chat=min'
    );

    dispatch(
      chatState({
        isMinimized: !isMinimized,
        queryString
      })
    );
    window.history.replaceState({}, '', queryString);
  }, [_chatState]);

  const clickTimeout: any = useRef();
  const handleCloseChatClick = useCallback(() => {
    if (!isOpen || _conversationMessages.status === 'pending') {
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
  }, [isOpen, _conversationMessages.status]);

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
        dispatch(conversationMessages({ data: [{ ...msg }] }));
        msgBox.value = '';
        setMsgBoxRowsMax(1);
        setScrollViewElevation('calc(21.5px - 1.25rem)');
        socket.send(JSON.stringify(msg));
      } else {
        displayConnectInfoThenReconnect();
      }
    } catch (e) {
      displaySocketErrInfo(e);
    }
  }, [
    msgBoxRowsMax,
    convoId,
    socket,
    displayConnectInfoThenReconnect,
    displaySocketErrInfo
  ]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      const scrollView = scrollViewRef.current!;
      const elevation = e.target.offsetHeight;
      const chatBoxMaxHeight = msgBoxInitHeight * msgBoxRowsMax;
      const remValue = elevation > msgBoxInitHeight * 4 ? 1.25 : 1.25;

      messageDrafts[convoId] = e.target.value;

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

      setScrollViewElevation(`calc(${elevation + 1.5}px - ${remValue}rem)`);
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

  const handleMessageSelection = useCallback(
    (id: string | null, value: SelectedMessageValue) => {
      setClearSelections(false);
      setSelectedMessages((prev) => {
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
    []
  );

  const handleClearSelections = useCallback(() => {
    setClearSelections(true);
    delay(10).then(() => setSelectedMessages({}));
  }, []);

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
            displayConnectInfoThenReconnect();
          }
        } catch (e) {
          displaySocketErrInfo(e);
        }
      }
    });
  }, [
    selectedMessages,
    confirmDeleteMessage,
    socket,
    handleClearSelections,
    displayConnectInfoThenReconnect,
    displaySocketErrInfo
  ]);

  const offset = (convoMessages[0] ?? {}).date;
  const handleScrollViewScroll = useCallback(() => {
    if (scrollView) {
      clearTimeout(loadMessagesTimeout);
      scrollViewScrollPos = scrollView.scrollHeight - scrollView.scrollTop;
      loadMessagesTimeout = setTimeout(() => {
        if (scrollView?.scrollTop <= 75 && !/end/.test(statusText as string)) {
          dispatch(
            getConversationMessages(
              convoId,
              'settled',
              'has offset',
              offset
            )(dispatch)
          );
        }
      }, 400);

      scrollView.classList.remove('scroll-ended');
      clearTimeout(hideScrollBarTimeout);
      hideScrollBarTimeout = setTimeout(() => {
        scrollView.classList.add('scroll-ended');
      }, 800);
    }
  }, [scrollView, convoId, offset, statusText]);

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
    if (!scrollView) setScrollView(scrollViewRef.current);

    //call this on app load to take care of wider screens where messages may not be long enough for a scroll
    handleScrollViewScroll();
  }, [scrollView, handleScrollViewScroll]);

  useEffect(() => {
    if ((cid || convoId) && msgBoxRef.current) {
      msgBoxRef.current.value = messageDrafts[convoId || cid] ?? '';

      if (!userDeviceIsMobile) {
        msgBoxRef.current.focus();
      }
    }
  }, [convoId, msgBoxRef, cid]);

  useEffect(() => {
    lastSeenForAway = _conversationInfo.data!?.last_seen!;
    displayAwayDate();

    if (online_status !== 'AWAY' || canDisplayAwayDate) {
      clearTimeout(renderAwayDateTimeout);
      _canDisplayAwayDate = false;
    }
  }, [online_status, canDisplayAwayDate, _conversationInfo.data]);

  useEffect(() => {
    if (!!convoMessages[0] && userData.online_status === 'ONLINE') {
      const [isOpen, isMinimized] = [!!chat, chat === 'min'];
      const isSameCid = convoId === cid;
      const userId = userData.id;

      if (isOpen && isSameCid && !isMinimized) {
        dispatch(conversations({ data: [{ unread_count: 0, _id: convoId }] }));
      }

      for (const message of convoMessages) {
        const isSeen = message.seen_by?.includes(userId);

        if (!message.sender_id || userId === message.sender_id || isSeen) {
          continue;
        }

        try {
          if (socket && socket.readyState === 1 && isSameCid) {
            if (isOpen) {
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

                if (!isMinimized) {
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
                      isMinimized && !isDelivered
                        ? CHAT_MESSAGE_DELIVERED
                        : CHAT_READ_RECEIPT
                  })
                );
              }
            } else continue;
          } else break;
        } catch (e) {
          displaySocketErrInfo(e);
          break;
        }
      }
    }
  }, [
    cid,
    convoId,
    chat,
    userData.id,
    userData.online_status,
    convoMessages,
    online_status,
    socket,
    displaySocketErrInfo
  ]);

  useEffect(() => {
    if (scrollView) {
      const canAdjustScrollTop =
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 300;
      const canAddScrollPadding =
        scrollView.scrollHeight > scrollView.offsetHeight;

      const scrollPos = scrollView.scrollHeight - scrollViewScrollPos;

      if (!statusText || /new/.test(statusText as string)) {
        scrollView.scrollTop = scrollView.scrollHeight;
      } else {
        //the code block below implies that if the request for or receipt of (a) new message(s) is not coming from a socket or message hasn't gotten to the very first message of the conversation and the receipt is coming from a request for previous messages (offset) in the conversation, scroll scrollView to the initial scroll position before messages were loaded.
        if (
          /offset/.test(statusText as string) &&
          status === 'fulfilled' &&
          !/end|socket|new/.test(statusText as string)
        ) {
          scrollView.scrollTop = scrollPos;
        }
      }

      if (canAddScrollPadding && !userDeviceIsMobile) {
        scrollView.classList.add('add-scroll-padding');
      } else {
        scrollView.classList.remove('add-scroll-padding');
      }

      if (convoMessages.length && /settled|fulfilled/.test(status as string)) {
        delay(400).then(() => {
          scrollView.classList.remove('hide-messages');
        });
      } else {
        scrollView.classList.add('hide-messages');
      }

      if (convoMessages && canAdjustScrollTop) {
        // animate (to prevent flicker) if scrollView is at very top else don't animate
        if (scrollView.scrollTop < scrollView.scrollHeight - 300) {
          interval(
            () => {
              scrollView.scrollTop += 100;
            },
            8,
            () =>
              scrollView.scrollTop >=
              scrollView.scrollHeight - scrollView.offsetHeight - 50
          );
        }
      }
    }
  }, [convoMessages, status, statusText, scrollView]);

  return (
    <>
      <Memoize
        memoizedComponent={Col}
        as='header'
        className='chat-header d-flex p-0'>
        <Row
          className={`title-control-wrapper px-2 mx-0 ${
            numOfSelectedMessages ? 'hide' : ''
          }`}>
          <Col as='span' className='colleague-name'>
            <Box component='span' className='control-wrapper'>
              <IconButton
                edge='start'
                className='conversations-menu-button ml-0 mr-1'
                color='inherit'
                onClick={handleConversationsMenuClick}
                aria-label='conversations menu'>
                <MenuIcon />
              </IconButton>
            </Box>

            {type === 'ONE_TO_ONE' ? (
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
                    _conversationInfo.status === 'fulfilled'
                      ? online_status?.toLowerCase()
                      : 'offline'
                  }`}
                  overlap='circle'
                  variant='dot'>
                  <Avatar
                    component='span'
                    className='chat-avatar'
                    alt={displayName}
                    src={`/images/${avatar}`}
                  />
                </Badge>{' '}
                <Col as='span' className='ml-2 p-0'>
                  <Col
                    as='span'
                    className={`display-name ${
                      _conversationInfo.status === 'pending'
                        ? 'status-hidden'
                        : !data?.last_seen
                        ? 'status-hidden'
                        : ''
                    } p-0`}>
                    {displayName ?? placeHolderDisplayName}
                  </Col>
                  <Col
                    as='span'
                    className={`status ${
                      _conversationInfo.status === 'fulfilled' &&
                      data?.last_seen
                        ? 'show'
                        : ''
                    } p-0`}>
                    {_conversationInfo.user_typing
                      ? 'typing...'
                      : online_status === 'ONLINE'
                      ? 'online'
                      : online_status === 'AWAY'
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
                  src={`/images/${avatar}`}
                />
                <Col as='span' className='ml-2 p-0'>
                  {displayName ?? placeHolderDisplayName}
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

            <Box component='span' className='control-wrapper ml-1'>
              <IconButton
                className='more-button'
                onClick={toggleMoreOptionsPopover}
                aria-label='more'>
                <MoreVertIcon />
              </IconButton>

              <Box
                component='span'
                className={`more-options-container ${
                  moreOptionsIsVisible ? 'visible' : ''
                } ${
                  isMinimized ? 'transform-upwards' : ''
                } d-inline-flex flex-column`}
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
              </Box>
            </Box>
          </Col>
        </Row>

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
      </Memoize>

      <Memoize
        memoizedComponent={{
          component: Col,
          ref: scrollViewRef
        }}
        as='section'
        className={`chat-scroll-view custom-scroll-bar grey-scrollbar`}
        style={{ marginBottom: scrollViewElevation }}
        onScroll={handleScrollViewScroll}>
        <Box
          className={`more-messages-loader theme-primary-lighter ${
            status === 'settled' && /offset/.test(statusText as string) && !err
              ? ''
              : 'hide'
          }`}
          textAlign='center'>
          <CircularProgress thickness={5} color='inherit' size={25} />
        </Box>
        <Box
          className={`pt-4 mb-4 text-center theme-tertiary-lighter ${
            (status === 'fulfilled' && /end/.test(statusText as string)) ||
            (convoMessages.length && convoMessages.length < 20)
              ? 'd-block'
              : 'd-none'
          }`}
          fontSize='0.85rem'>
          This is the beginning of your conversation with{' '}
          {_conversationInfo.data?.displayName ?? 'your colleague'}.
        </Box>
        {convoMessages.map((message, key: number) => {
          const { sender_id, date, delivered_to, deleted, seen_by } = message;
          const prevDate = new Date(
            Number(convoMessages[key - 1]?.date)
          ).toDateString();
          const nextDate = new Date(
            Number(convoMessages[key + 1]?.date)
          ).toDateString();
          const selfDate = new Date(Number(message.date)).toDateString();
          const prevAndSelfSentSameDay = prevDate === selfDate;
          const nextAndSelfSentSameDay = nextDate === selfDate;
          const shouldRenderDate = !prevAndSelfSentSameDay;
          const prevDelayed =
            date! - (convoMessages[key - 1]?.date ?? date!) >= 18e5;
          const nextDelayed =
            (convoMessages[key + 1]?.date ?? date!) - date! >= 18e5;

          const type =
            sender_id && sender_id !== userData.id ? 'incoming' : 'outgoing';
          const prevSenderId = (convoMessages[key - 1] ?? {}).sender_id;
          const nextSenderId = (convoMessages[key + 1] ?? {}).sender_id;
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
            nextSenderId !== sender_id ||
            !nextAndSelfSentSameDay ||
            nextDelayed;
          const className = `${prevDelayed ? 'delayed mt-3' : ''}${
            isFirstOfStack ? ' first' : ''
          }${isOnlyOfStack ? ' only' : ''}${isLastOfStack ? ' last' : ''}${
            isMiddleOfStack ? ' middle' : ''
          }${
            _conversationInfo.new_message?._id === message._id ||
            message.timestamp_id
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
                userId={userData.id}
                participants={conversation.participants}
                canSelectByClick={!!Object.keys(selectedMessages)[0]}
                handleMessageSelection={handleMessageSelection}
              />
            </React.Fragment>
          );
        })}
        {!conversation.friendship &&
          _conversationMessages.status === 'fulfilled' && (
            <Box className='text-center py-5 my-2'>
              You are not colleagues with{' '}
              <Box fontWeight='bold'>{displayName}.</Box>
              <br />
              Send{' '}
              <Link
                className='font-bold'
                onClick={handleProfileLinkClick}
                to={`/@${
                  conversation.associated_username
                }${window.location.search.replace('open', 'min')}`}>
                {displayName?.split(' ')[0]}
              </Link>{' '}
              a colleague request to continue your conversation.
            </Box>
          )}
      </Memoize>

      <Box className='scroll-bar-fader' />

      <Box
        className='theme-tertiary-lighter d-flex align-items-center justify-content-center messages-status-signal'
        height='100%'
        fontWeight='bold'>
        {status === 'fulfilled' && !convoMessages.length && conversation._id ? (
          <Box fontSize='1.1rem' textAlign='center' maxWidth='100%'>
            <ChatIcon fontSize='large' />
            <br />
            No messages here.
            <br />
            <br />
            {conversation.friendship ? (
              <>
                Send a message to begin a new conversation with{' '}
                <Box fontWeight='bold'>{displayName}.</Box>
              </>
            ) : (
              <>
                You are not colleagues with{' '}
                <Box fontWeight='bold'>{displayName}.</Box>
                <br />
                Send{' '}
                <Link
                  className='font-bold'
                  onClick={handleProfileLinkClick}
                  to={`/@${
                    conversation.associated_username
                  }${window.location.search.replace('open', 'min')}`}>
                  {displayName.split(' ')[0]}
                </Link>{' '}
                a colleague request to start a conversation.
              </>
            )}
          </Box>
        ) : conversation._id ? (
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
        memoizedComponent={Col}
        as='section'
        className={`chat-msg-box p-0 ${!convoId ? 'hide' : 'show'}`}>
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
      </Memoize>

      <Memoize
        memoizedComponent={ConfirmDialog}
        open={openConfirmDialog}
        action={dialogAction}
        canDeleteForEveryone={canDeleteForEveryone}
      />
    </>
  );
};

export default ChatMiddlePane;