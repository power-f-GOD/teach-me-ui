import React, { useRef, useState, useEffect, useCallback } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ScheduleIcon from '@material-ui/icons/Schedule';
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
  // timestampFormatter,
  delay,
  interval,
  preventEnterNewLine,
  timestampFormatter
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import { displaySnackbar, initWebSocket } from '../../actions';
import { CHAT_TYPING } from '../../constants/chat';
// import { Skeleton, DISPLAY_INFO } from './Loaders';

const Memoize = createMemo();

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
  const { isMinimized }: ChatState = _chatState;

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [selectedMessages, setSelectedMessages] = useState<{
    [index: number]: string | null;
  }>({});
  const [clearSelections, setClearSelections] = useState<boolean>(false);
  const numOfSelectedMessages = Object.keys(selectedMessages).length;

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

  const handleCloseChatClick = useCallback(() => {
    dispatch(
      chatState({
        isMinimized: false,
        isOpen: false,
        queryString: ''
      })
    );
    window.history.pushState({}, '', window.location.pathname);
  }, []);

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
        dispatch(
          displaySnackbar({
            open: true,
            autoHide: false,
            severity: 'info',
            message:
              "Couldn't send message. Seems you are/were offline. We'll try to reconnect then you can try sending message again."
          })
        );
        dispatch(initWebSocket(userData.token as string));
      }
    } catch (e) {
      dispatch(
        displaySnackbar({
          open: true,
          autoHide: false,
          severity: 'error',
          message:
            'Send message failed. Could not establish connection with server.'
        })
      );
      console.error('Error:', e, 'Message:', msg, 'failed to send.');
    }
  }, [msgBoxRowsMax, convoId, socket, userData.token]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      if (socket && socket.readyState === 1) {
        socket.send(
          JSON.stringify({ conversation_id: convoId, pipe: CHAT_TYPING })
        );
      }

      if (!e.shiftKey && e.key === 'Enter' && !userDeviceIsMobile) {
        handleSendMsgClick();
        return false;
      } else if (
        (e.shiftKey && e.key === 'Enter') ||
        e.target.scrollHeight > msgBoxInitHeight
      ) {
        setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      }

      const scrollView = scrollViewRef.current!;
      const elevation = e.target.offsetHeight;
      const chatBoxMaxHeight = msgBoxInitHeight * msgBoxRowsMax;
      const remValue = elevation > msgBoxInitHeight * 4 ? 1.25 : 1.25;

      if (elevation <= chatBoxMaxHeight) {
        if (elevation > msgBoxCurrentHeight) {
          //makes sure right amount of scrollTop is set when scrollView scroll position is at the very bottom
          delay(200).then(() => {
            if (
              scrollView.scrollHeight -
                scrollView.offsetHeight -
                msgBoxInitHeight * 2 <=
              scrollView.scrollTop
            ) {
              scrollView.scrollTop += 19;
            }
          });
          scrollView.scrollTop += 19;
        } else if (elevation < msgBoxCurrentHeight) {
          scrollView.scrollTop -= 19;
        }
      }

      setScrollViewElevation(`calc(${elevation}px - ${remValue}rem)`);
      setMsgBoxCurrentHeight(elevation);
    },
    [socket, convoId, msgBoxCurrentHeight, msgBoxRowsMax, handleSendMsgClick]
  );

  const handleMessageSelection = useCallback(
    (id: string | null, index: number) => {
      setClearSelections(false);
      setSelectedMessages((prev) => {
        const newState = { ...prev, ...{ [index]: id } };

        if (!id) {
          delete newState[index];
        }

        return newState;
      });
    },
    []
  );

  const handleClearSelections = useCallback(
    (value: boolean) => () => {
      setClearSelections(value);

      if (value) {
        setSelectedMessages({});
      }
    },
    []
  );

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  useEffect(() => {
    if (convoMessages && scrollView) {
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
  }, [convoMessages, scrollView]);

  return (
    <>
      <Col as='header' className='chat-header d-flex p-0'>
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
                {!isMinimized ? (
                  <Col as='span' className='minimize-icon'>
                    ─
                  </Col>
                ) : (
                  <WebAssetIcon fontSize='inherit' />
                )}
              </IconButton>
            </Col>
            <Col xs={6} as='span' className='close-wrapper'>
              <IconButton
                className='close-button'
                onClick={handleCloseChatClick}
                aria-label='close chat box'>
                <CloseIcon fontSize='inherit' />
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
                  onClick={handleClearSelections(true)}
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
              className='delete-button d-none mr-2'
              // onClick={handleDeleteMessageClick}
              aria-label='delete message'>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Row>
      </Col>

      <Memoize
        memoizedComponent={{
          component: Col,
          ref: scrollViewRef
        }}
        as='section'
        className='chat-scroll-view custom-scroll-bar grey-scrollbar'
        style={{ marginBottom: scrollViewElevation }}>
        {!!convoMessages[0] && _conversationMessages.status === 'fulfilled' ? (
          convoMessages.map((message, key: number) => (
            <Message
              message={message}
              type={
                message.sender_id && message.sender_id !== userData.id
                  ? 'incoming'
                  : 'outgoing'
              }
              clearSelections={clearSelections}
              index={key}
              userId={userData.id}
              participants={conversation.participants}
              handleClearSelections={handleClearSelections}
              handleMessageSelection={handleMessageSelection}
              key={key}
            />
          ))
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

      <Col
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
    </>
  );
};

function Message(props: {
  message: Partial<APIMessageResponse>;
  type: 'incoming' | 'outgoing';
  userId: string;
  index: number;
  clearSelections: boolean;
  participants: string[];
  handleMessageSelection: Function;
  handleClearSelections: Function;
}) {
  const {
    type,
    message,
    participants,
    userId,
    index,
    clearSelections,
    handleMessageSelection,
    handleClearSelections
  } = props;
  const {
    message: text,
    date,
    timestamp_id,
    delivered_to,
    seen_by,
    _id: id
  } = message;
  const timestamp = timestampFormatter(date);
  const isDelivered =
    type === 'outgoing' &&
    participants
      .filter((id) => id !== userId)
      .every((participant) => delivered_to?.includes(participant));
  const isSeen =
    type === 'outgoing' &&
    participants
      .filter((id) => id !== userId)
      .every((participant) => seen_by?.includes(participant));

  const [selected, setSelected] = useState<boolean | null>(null);

  const handleMessageDblClick = useCallback(
    (e: any) => {
      if (type === 'incoming') return;
      handleClearSelections(false);
      setSelected((prev) => !prev);
    },
    [type, handleClearSelections]
  );

  useEffect(() => {
    if (type === 'outgoing' && selected !== null) {
      handleMessageSelection(selected ? id : null, index);
    }
  }, [
    selected,
    id,
    index,
    type,
    handleMessageSelection,
    handleClearSelections
  ]);

  useEffect(() => {
    if (type === 'outgoing' && selected !== null && clearSelections) {
      setSelected(false);
      handleMessageSelection(null, index);
    }
  }, [selected, clearSelections, index, type, handleMessageSelection]);

  return (
    <Container
      className={`${type === 'incoming' ? 'incoming' : 'outgoing'} ${
        selected ? 'selected' : ''
      } msg-container p-0 m-0`}
      onDoubleClick={handleMessageDblClick}>
      <Col
        as='div'
        className='msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end'>
        <Box>
          {/* <Col as='span' className='scroll-view-msg'> */}
          {text}
          {/* </Col> */}
          <Col as='span' className='chat-timestamp-wrapper p-0'>
            <Col as='span' className='chat-timestamp d-inline-block'>
              {timestamp}{' '}
              {type !== 'incoming' &&
                (timestamp_id ? (
                  <ScheduleIcon />
                ) : isSeen || isDelivered ? (
                  <DoneAllIcon className={isSeen ? 'read' : ''} />
                ) : (
                  <DoneIcon />
                ))}
            </Col>
          </Col>
        </Box>
      </Col>
    </Container>
  );
}

export default ChatMiddlePane;
