import React, { useState, useCallback, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
// import ChatIcon from '@material-ui/icons/Chat';
import ForumIcon from '@material-ui/icons/Forum';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import createMemo from '../../Memo';
import { timestampFormatter, dispatch } from '../../functions';
import { setActiveChat } from '../../actions/chat';
import { Chat, Message } from '../../constants/interfaces';
import { CONVO_CHAT_TYPE, ROOM_CHAT_TYPE } from '../../constants/chat';
import ChatLeftPane from './ChatLeftPane';

const msgBoxRef = createRef<HTMLInputElement>();
const scrollViewRef = createRef<HTMLElement>();
const msgBoxInitHeight = 19;

// const themeColorPrimary = '#00537e';
// const themeColorSecondary = '#465d00';

const Memoize = createMemo();

// const cookieEnabled = navigator.cookieEnabled;

window.addEventListener('popstate', (e) => {
  let { chat, name, type: _type } = queryString.parse(window.location.search);
  let type: 'conversation' | 'classroom' =
    _type === CONVO_CHAT_TYPE ? CONVO_CHAT_TYPE : ROOM_CHAT_TYPE;

  if (chat) {
    name = name ? String(name) : 'Start a Conversation';

    if (chat === 'open') {
      dispatch(setActiveChat({ name, type, isOpen: true, isMinimized: false }));
    } else {
      dispatch(setActiveChat({ name, type, isOpen: true, isMinimized: true }));
    }
  } else {
    dispatch(
      setActiveChat({
        name: 'Start a Conversation',
        type: CONVO_CHAT_TYPE,
        isOpen: false,
        isMinimized: false
      })
    );
  }
});

const conversations: Chat[] = [
  {
    name: 'Emmanuel Sunday',
    avatar: 'emmanuel.png',
    type: CONVO_CHAT_TYPE
  },
  {
    name: 'Abba Chinomso',
    avatar: 'avatar-2.png',
    type: CONVO_CHAT_TYPE
  }
];
const rooms: Chat[] = [
  {
    name: 'Room 1',
    type: ROOM_CHAT_TYPE
  },
  {
    name: 'Room 2',
    type: ROOM_CHAT_TYPE
  },
  {
    name: 'Room 3',
    type: ROOM_CHAT_TYPE
  }
];
const participants: Chat[] = [
  {
    name: 'Emmanuel Sunday',
    avatar: 'emmanuel.png'
  },
  {
    name: 'Abba Chinomso',
    avatar: 'avatar-2.png'
  },
  {
    name: 'Sunday Power',
    avatar: 'avatar-1.png'
  }
];

const ChatBox = (props: any) => {
  const {
    name: activeChatName,
    avatar: activeChatAvatar,
    queryString: activeChatQString,
    type: activeChatType,
    isOpen,
    isMinimized
  }: Chat = props.activeChat;

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);

  const setBodyOverflow = useCallback(() => {
    // const metaTheme = document.querySelector('meta#theme-color') as any;
    let bodyStyle = document.body.style;

    // if (window.innerWidth < 768 && !isOpen && !isMinimized) {
    if (isOpen && !isMinimized) {
      // metaTheme.content = themeColorSecondary;
      bodyStyle.overflow = 'hidden';
    } else {
      setTimeout(() => (bodyStyle.overflow = 'auto'), 350);
      // metaTheme.content = themeColorPrimary;
    }
  }, [isOpen, isMinimized]);

  const handleMinimizeChatClick = useCallback(() => {
    const queryString = activeChatQString!.replace(
      isMinimized ? 'chat=minimized' : 'chat=open',
      isMinimized ? 'chat=open' : 'chat=minimized'
    );

    dispatch(
      setActiveChat({
        name: activeChatName,
        type: activeChatType,
        avatar: activeChatAvatar,
        isMinimized: !isMinimized,
        queryString
      })
    );
    window.history.replaceState({}, '', window.location.pathname + queryString);
  }, [
    activeChatName,
    activeChatAvatar,
    activeChatType,
    activeChatQString,
    isMinimized
  ]);

  const handleCloseChatClick = useCallback(() => {
    const queryString = window.location.search;

    dispatch(
      setActiveChat({
        name: activeChatName,
        type: activeChatType,
        avatar: activeChatAvatar,
        isOpen: false,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname);
  }, [activeChatName, activeChatAvatar, activeChatType]);

  const handleOpenChatClick = useCallback(() => {
    const queryString = /chat=/.test(String(activeChatQString))
      ? activeChatQString
      : `?chat=${
          isMinimized ? 'minimized' : 'open'
        }&type=${activeChatType}&name=${activeChatName}`;

    dispatch(
      setActiveChat({
        name: activeChatName,
        type: activeChatType,
        avatar: activeChatAvatar,
        isOpen: true,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [
    activeChatName,
    activeChatAvatar,
    activeChatType,
    activeChatQString,
    isMinimized
  ]);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const timestamp = timestampFormatter();
    const msg: Message = {
      type: 'outgoing',
      text: msgBox.value.trim(),
      timestamp
    };

    if (!msg.text) {
      setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    msgBox.value = '';
    setMsgBoxRowsMax(1);
    setMessages((prevState: Message[]) => {
      const newMessages = [...prevState];

      newMessages.push(msg);
      return newMessages;
    });
    setScrollViewElevation('calc(19px - 1.25rem)');

    window.setTimeout(() => {
      const timestamp = timestampFormatter();
      const msg: Message = {
        type: 'incoming',
        text:
          'A sample response from the end user via the server (web socket)...',
        timestamp
      };

      setMessages((prevState: Message[]) => {
        const newMessages = [...prevState];

        newMessages.push(msg);
        return newMessages;
      });
    }, 2000);
  }, [msgBoxRowsMax]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      if (!e.shiftKey && e.key === 'Enter') {
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
          window.setTimeout(() => {
            if (
              scrollView.scrollHeight -
                scrollView.offsetHeight -
                msgBoxInitHeight * 2 <=
              scrollView.scrollTop
            ) {
              scrollView.scrollTop += 19;
            }
          }, 200);
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

  const preventEnterNewLine = useCallback((e) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  useEffect(() => {
    if (messages && scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages, scrollView]);

  useEffect(setBodyOverflow, [isOpen, isMinimized]);

  useEffect(() => {
    const { search } = window.location;
    const { chat } = queryString.parse(search);

    dispatch(
      setActiveChat({
        name: activeChatName,
        type: activeChatType,
        avatar: activeChatAvatar,
        queryString: !!chat ? search : activeChatQString,
        isOpen: !!chat || isOpen
      })
    );
  }, [
    activeChatName,
    activeChatAvatar,
    activeChatType,
    activeChatQString,
    isOpen
  ]);

  return (
    <Container fluid className='ChatBox p-0'>
      <Container className='chat-box-container'>
        <Row
          className={`chat-box-wrapper m-0 ${isMinimized ? 'minimize' : ''} ${
            isOpen ? '' : 'close'
          } debugger`}>
          <Col as='section' md={3} className='chat-left-pane d-flex p-0'>
            <ChatLeftPane conversations={conversations} rooms={rooms} />
          </Col>

          <Col
            as='section'
            md={6}
            className='chat-middle-pane d-flex flex-column p-0'>
            <Col as='header' className='chat-header d-flex p-0'>
              <Col as='span' className='colleague-name'>
                {activeChatType === CONVO_CHAT_TYPE ? (
                  <>
                    <Badge
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      color='primary'
                      overlap='circle'
                      variant='dot'>
                      <Avatar
                        component='span'
                        className='chat-avatar mr-2'
                        alt={activeChatName}
                        src={`/images/${activeChatAvatar}`}
                      />
                    </Badge>{' '}
                    {activeChatName}
                  </>
                ) : (
                  <>
                    <Avatar
                      component='span'
                      className='chat-avatar mr-2'
                      alt='Emmanuel Sunday'
                      src={`/images/${activeChatAvatar}`}
                    />
                    {activeChatName}
                  </>
                )}
              </Col>

              <Col as='span' className='controls p-0'>
                <Col xs={6} as='span' className='minimize-wrapper'>
                  <IconButton
                    // edge='start'
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
                  {/* </Link> */}
                </Col>
                <Col xs={6} as='span' className='close-wrapper'>
                  <IconButton
                    // edge='start'
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
                component: Grid,
                ref: scrollViewRef
              }}
              component='section'
              className='chat-scroll-view custom-scroll-bar d-flex flex-column col'
              style={{ marginBottom: scrollViewElevation }}>
              {!!messages[0] ? (
                messages.map((message, key: number) =>
                  message.type === 'incoming' ? (
                    <IncomingMsg message={message} key={key} />
                  ) : (
                    <OutgoingMsg message={message} key={key} />
                  )
                )
              ) : (
                <Col className='theme-tertiary-lighter d-flex align-items-center justify-content-center'>
                  Start a new conversation.
                </Col>
              )}
            </Memoize>

            <Col
              as='section'
              className={`chat-msg-box d-flex p-0 ${
                /start.*conv/i.test(String(activeChatName)) ? 'hide' : 'show'
              }`}>
              <Col as='span' className='emoji-wrapper p-0'>
                <IconButton
                  // edge='start'
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
                  className='msg-box custom-scroll-bar'
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
                  // onChange={}
                />
              </Col>
              <Col as='span' className='send-wrapper p-0'>
                <IconButton
                  // edge='start'
                  className='send-button'
                  onClick={handleSendMsgClick}
                  aria-label='send msg'>
                  <SendIcon fontSize='inherit' />
                </IconButton>
              </Col>
            </Col>
          </Col>

          <Col
            as='section'
            md={3}
            className='chat-right-pane d-flex flex-column p-0'>
            <ChatRightPane participants={participants} type={activeChatType} />
          </Col>
        </Row>

        <IconButton
          // edge='start'
          className={`chat-button ${isOpen ? 'hide' : ''}`}
          onClick={handleOpenChatClick}
          aria-label='chat'>
          <ForumIcon fontSize='inherit' />
        </IconButton>
      </Container>
    </Container>
  );
};

function ChatRightPane(props: any) {
  const { participants, type: activeChatType } = props;
  return (
    <>
      <Col as='header' className='chat-header d-flex flex-column justify-content-center'>
        {activeChatType === CONVO_CHAT_TYPE ? 'User info' : 'Participants'}
      </Col>
      
      <Col as='section' className='participants-container p-0'>
        {activeChatType === ROOM_CHAT_TYPE &&
          participants.map((participant: any, key: string) => {
            return (
              <Col as='span' className='colleague-name' key={participant.name}>
                <Badge
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  color='primary'
                  overlap='circle'
                  variant='dot'>
                  <Avatar
                    component='span'
                    className='chat-avatar mr-2'
                    alt={participant.name}
                    src={`/images/${participant.avatar}`}
                  />
                </Badge>{' '}
                {participant.name}
              </Col>
            );
          })}
      </Col>
    </>
  );
}

function IncomingMsg(props: { message: Message } | any) {
  const { text, timestamp } = props.message;

  return (
    <Container className='incoming-msg-container p-0 m-0'>
      <Col
        as='div'
        className='incoming-msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end p-0'>
        <Col as='span' className='scroll-view-msg d-block'>
          {text}
        </Col>
        <Col as='span' className='chat-timestamp-wrapper d-block p-0'>
          <Col as='span' className='chat-timestamp d-inline-block m-0'>
            {timestamp}
          </Col>
        </Col>
      </Col>
    </Container>
  );
}

function OutgoingMsg(props: { message: Message } | any) {
  const { text, timestamp } = props.message;

  return (
    <Container className='outgoing-msg-container p-0 m-0'>
      <Col
        as='div'
        className='outgoing-msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end p-0'>
        <Col as='span' className='scroll-view-msg d-block'>
          {text}
        </Col>
        <Col as='span' className='chat-timestamp-wrapper d-block p-0'>
          <Col as='span' className='chat-timestamp d-inline-block m-0'>
            {timestamp}
          </Col>
        </Col>
      </Col>
    </Container>
  );
}

const mapStateToProps = (state: any) => {
  return {
    activeChat: state.activeChat
  };
};

export default connect(mapStateToProps)(ChatBox);
