import React, { useRef, useState, useEffect, useCallback } from 'react';

import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
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

import {
  ChatState,
  MessageProps,
  APIConversationResponse,
  APIMessageResponse,
  UserData,
  ConversationInfo,
  SearchState
} from '../../constants/interfaces';
import createMemo from '../../Memo';
import { userDeviceIsMobile } from '../../';
import { chatState, conversationMessages } from '../../actions/chat';
import {
  dispatch,
  // timestampFormatter,
  delay,
  preventEnterNewLine,
  timestampFormatter
} from '../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import { displaySnackbar } from '../../actions';
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
    const queryString = window.location.search;

    dispatch(
      chatState({
        isMinimized: false,
        isOpen: false,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname);
  }, []);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const msg: MessageProps = {
      message: msgBox.value.trim(),
      time_stamp_id: String(Date.now()),
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
  }, [msgBoxRowsMax, convoId, socket]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
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
    [msgBoxCurrentHeight, msgBoxRowsMax, handleSendMsgClick]
  );

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  useEffect(() => {
    // console.log('convoMessages:', convoMessages)
    if (!!convoMessages && scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [convoMessages, scrollView]);

  return (
    <>
      <Col as='header' className='chat-header d-flex p-0'>
        {
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
                <Col as='span' className='ml-2 p-0'>
                  {displayName ?? placeHolderDisplayName}
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
        }

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
      </Col>

      <Memoize
        memoizedComponent={{
          component: Col,
          ref: scrollViewRef
        }}
        component='section'
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
        className={`chat-msg-box d-flex p-0 ${!convoId ? 'hide' : 'show'}`}>
        <Col as='span' className='emoji-wrapper p-0'>
          <IconButton
            className='emoji-button'
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
}) {
  const { type, message } = props;
  const { message: text, date } = message;
  const timestamp_id = message.time_stamp_id;
  const seen_by = message.seen_by;
  const timestamp = timestampFormatter(date);

  return (
    <Container
      className={`${
        type === 'incoming' ? 'incoming' : 'outgoing'
      } msg-container p-0 m-0`}>
      <Col
        as='div'
        className='msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end p-0'>
        <Col as='span' className='scroll-view-msg d-block'>
          {text}
        </Col>
        <Col as='span' className='chat-timestamp-wrapper d-block p-0'>
          <Col as='span' className='chat-timestamp d-inline-block'>
            {timestamp}{' '}
            {timestamp_id ? (
              <ScheduleIcon />
            ) : !!seen_by![0] ? (
              <DoneAllIcon className={'read'} />
            ) : (
              <DoneIcon />
            )}
          </Col>
        </Col>
      </Col>
    </Container>
  );
}

export default ChatMiddlePane;
