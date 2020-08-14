import React, { useRef, useState, useEffect, useCallback } from 'react';

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
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  ChatState,
  MessageProps,
  APIConversationResponse,
  APIMessageResponse,
  UserData,
  ConversationInfo,
  SearchState,
  Partial
} from '../../constants/interfaces';
import createMemo from '../../Memo';
import { userDeviceIsMobile } from '../../';
import { chatState, conversationMessages } from '../../actions/chat';
import {
  dispatch,
  delay,
  interval,
  preventEnterNewLine
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import { displaySnackbar, initWebSocket } from '../../actions';
import {
  CHAT_TYPING,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR
} from '../../constants/chat';
import ConfirmDialog, {
  Message,
  ChatDate,
  SelectedMessageValue,
  ActionChoice
} from './Chat.crumbs';

const Memoize = createMemo();
const aDayInMs = 86400000;

interface ChatMiddlePaneProps {
  conversation: APIConversationResponse;
  conversationMessages: SearchState;
  userData: UserData;
  chatState: ChatState;
  conversationInfo: ConversationInfo;
  webSocket: WebSocket;
}

const ChatMiddlePane = (props: ChatMiddlePaneProps) => {
  const msgBoxRef = useRef<HTMLInputElement | null>(null);
  const scrollViewRef = useRef<HTMLElement | null>(null);
  const msgBoxInitHeight = 19;
  const {
    conversation,
    conversationMessages: _conversationMessages,
    chatState: _chatState,
    userData,
    conversationInfo: _conversationInfo,
    webSocket: socket
  } = props;
  const convoMessages = _conversationMessages.data as Partial<
    APIMessageResponse
  >[];
  const {
    _id: convoId,
    type,
    avatar,
    conversation_name: displayName
  } = conversation;
  const { isMinimized, isOpen }: ChatState = _chatState;

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState<
    string
  >();
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

  const today = new Date().toDateString();
  const numOfSelectedMessages = Object.keys(selectedMessages).length;

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
      window.history.pushState({}, '', window.location.pathname);
    }, 300);
  }, [isOpen, _conversationMessages.status]);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const msg: MessageProps = {
      message: msgBox.value.trim(),
      timestamp_id: String(Date.now()),
      pipe: 'CHAT_NEW_MESSAGE',
      date: Date.now(),
      conversation_id: convoId
    };

    if (!msg.message) {
      setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    try {
      if (socket && socket.readyState === 1) {
        dispatch(conversationMessages({ data: [{ ...msg }] }));
        msgBox.value = '';
        setMsgBoxRowsMax(1);
        setScrollViewElevation('calc(19px - 1.25rem)');
        socket.send(JSON.stringify(msg));
        // console.log('message:', msg, 'was sent.');
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

      if (socket && socket.readyState === 1) {
        socket.send(
          JSON.stringify({ conversation_id: convoId, pipe: CHAT_TYPING })
        );
      }

      if (e.key === 'Enter') {
        if (!e.shiftKey && !userDeviceIsMobile) {
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
        setMsgBoxRowsMax(
          msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax
        );
      }

      setScrollViewElevation(`calc(${elevation}px - ${remValue}rem)`);
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

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  useEffect(() => {
    if (scrollView) {
      const canAdjustScrollTop =
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 100;

      if (convoMessages && (scrollView.scrollTop === 0 || canAdjustScrollTop)) {
        // animate (to prevent flicker) if scrollView is at very top else don't animate
        if (scrollView.scrollTop < scrollView.scrollHeight - 300) {
          interval(
            () => {
              scrollView.scrollTop += 100;
            },
            16,
            () =>
              scrollView.scrollTop >=
              scrollView.scrollHeight - scrollView.offsetHeight - 50
          );
        } else {
          scrollView.scrollTop = scrollView.scrollHeight;
        }
      }
    }
  }, [convoMessages, scrollView]);

  return (
    <>
      <Memoize
        memoizedComponent={Col}
        as='header'
        className='chat-header d-flex p-0'>
        <Box className='d-flex title-control-wrapper'>
          <Col as='span' className='colleague-name'>
            {type === 'ONE_TO_ONE' ? (
              <>
                <Badge
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  className='offline'
                  overlap='circle'
                  variant='dot'>
                  <Avatar
                    component='span'
                    className='chat-avatar'
                    alt={displayName}
                    src={`/images/${avatar}`}
                  />
                </Badge>{' '}
                <Col as='span' className='ml-1 p-0'>
                  <Col
                    as='span'
                    className={`display-name ${
                      _conversationInfo.user_typing ? '' : 'status-hidden'
                    } p-0`}>
                    {displayName ?? placeHolderDisplayName}
                  </Col>
                  <Col
                    as='span'
                    className={`status ${
                      _conversationInfo.user_typing ? 'show' : ''
                    } p-0`}>
                    typing...
                  </Col>
                </Col>
              </>
            ) : !convoId ? (
              <Col as='span' className='ml-2 p-0'>
                {placeHolderDisplayName}
              </Col>
            ) : (
              <>
                <Avatar
                  component='span'
                  className='chat-avatar'
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
            <Col xs={6} as='span' className='minimize-wrapper'>
              <IconButton
                className='minimize-button'
                onClick={handleMinimizeChatClick}
                aria-label='minimize chat box'>
                {!isMinimized ? <MinimizeIcon /> : <WebAssetIcon />}
              </IconButton>
            </Col>
            <Col xs={6} as='span' className='close-wrapper'>
              <IconButton
                className='close-button'
                onClick={handleCloseChatClick}
                aria-label='close chat box'>
                <CloseIcon />
              </IconButton>
            </Col>
          </Col>
        </Box>

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
      </Memoize>

      <Memoize
        memoizedComponent={{
          component: Col,
          ref: scrollViewRef
        }}
        as='section'
        className='chat-scroll-view custom-scroll-bar grey-scrollbar'
        style={{ marginBottom: scrollViewElevation }}>
        {!!convoMessages[0] && _conversationMessages.status === 'fulfilled' ? (
          convoMessages.map((message, key: number) => {
            const prevDate = new Date(
              Number(convoMessages[key - 1]?.date)
            ).toDateString();
            const nextDate = new Date(
              Number(convoMessages[key + 1]?.date)
            ).toDateString();
            const selfDate = new Date(Number(message.date)).toDateString();
            const selfSentToday = selfDate === today;
            const selfSentYesterday =
              (Math.abs(
                (new Date(today) as any) - (new Date(selfDate) as any)
              ) as any) /
                aDayInMs ===
              1;
            const prevAndSelfSentSameDay = prevDate === selfDate;
            const nextAndSelfSentSameDay = nextDate === selfDate;
            const shouldRenderDate = !prevAndSelfSentSameDay;
            const longTimeBtwMsgs =
              message.date! - (convoMessages[key - 1]?.date ?? message.date!) >=
              18e5;

            const type =
              message.sender_id && message.sender_id !== userData.id
                ? 'incoming'
                : 'outgoing';
            const prevSenderId = (convoMessages[key - 1] ?? {}).sender_id;
            const nextSenderId = (convoMessages[key + 1] ?? {}).sender_id;
            const isFirstOfStack =
              prevSenderId !== message.sender_id || !prevAndSelfSentSameDay;
            const isOnlyOfStack =
              (prevSenderId !== message.sender_id &&
                nextSenderId !== message.sender_id) ||
              (!nextAndSelfSentSameDay && !prevAndSelfSentSameDay);
            const isMiddleOfStack =
              prevSenderId === message.sender_id &&
              nextSenderId === message.sender_id &&
              nextAndSelfSentSameDay &&
              prevAndSelfSentSameDay;
            const isLastOfStack =
              nextSenderId !== message.sender_id || !nextAndSelfSentSameDay;
            const className = `${longTimeBtwMsgs ? 'mt-2 ' : ''}${
              isFirstOfStack ? 'first ' : ''
            }${isOnlyOfStack ? 'only ' : ''}${isLastOfStack ? 'last ' : ''}${
              isMiddleOfStack ? 'middle' : ''
            }`;
            // console.log('message:', message)
            return (
              <React.Fragment key={key}>
                {shouldRenderDate && (
                  <ChatDate
                    timestamp={Number(message.date)}
                    sentToday={selfSentToday}
                    sentYesterday={selfSentYesterday}
                  />
                )}
                <Memoize
                  memoizedComponent={Message}
                  message={message}
                  type={type}
                  clearSelections={
                    message._id! in selectedMessages && clearSelections
                      ? true
                      : false
                  }
                  deleted={message.deleted}
                  id={message._id}
                  className={className}
                  userId={userData.id}
                  participants={conversation.participants}
                  canSelectByClick={!!Object.keys(selectedMessages)[0]}
                  handleMessageSelection={handleMessageSelection}
                />
              </React.Fragment>
            );
          })
        ) : (
          <Box
            className='theme-tertiary-lighter d-flex align-items-center justify-content-center'
            height='100%'
            fontWeight='bold'>
            {_conversationMessages.status === 'fulfilled' &&
            !convoMessages[0] ? (
              `Start a new conversation with your new colleague, ${displayName}.`
            ) : conversation._id ? (
              <Box component='span' fontSize='3rem'>
                . . .
              </Box>
            ) : (
              'Start a new conversation.'
            )}
          </Box>
        )}
      </Memoize>

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
