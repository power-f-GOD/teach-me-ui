import React, { useState, useCallback, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ForumIcon from '@material-ui/icons/Forum';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import createMemo from '../../Memo';
import { timestampFormatter, dispatch, getState } from '../../functions';
import { setActiveChat, setChatsMessages } from '../../actions/chat';
import { Chat, Message } from '../../constants/interfaces';
import { CONVO_CHAT_TYPE, ROOM_CHAT_TYPE } from '../../constants/chat';
import ChatLeftPane from './ChatLeftPane';
import { userDeviceIsMobile } from '../..';

const msgBoxRef = createRef<HTMLInputElement>();
const scrollViewRef = createRef<HTMLElement>();
const msgBoxInitHeight = 19;

const Memoize = createMemo();

const cookieEnabled = navigator.cookieEnabled;

const placeHolderChatName = 'Start a new Conversation';

const conversations: Chat[] = [
  {
    name: 'Emmanuel Sunday',
    avatar: 'emmanuel.png',
    type: CONVO_CHAT_TYPE,
    get id() {
      return this.name;
    }
  },
  {
    name: 'Abba Chinomso',
    avatar: 'avatar-2.png',
    type: CONVO_CHAT_TYPE,
    get id() {
      return this.name;
    }
  }
];
const rooms: Chat[] = [
  {
    name: 'Room 1',
    type: ROOM_CHAT_TYPE,
    avatar: '',
    get id() {
      return this.name;
    }
  },
  {
    name: 'Room 2',
    type: ROOM_CHAT_TYPE,
    avatar: '',
    get id() {
      return this.name;
    }
  },
  {
    name: 'Room 3',
    type: ROOM_CHAT_TYPE,
    avatar: '',
    get id() {
      return this.name;
    }
  }
];
const participants: Chat[] = [
  {
    name: 'Emmanuel Sunday',
    avatar: 'emmanuel.png',
    get id() {
      return this.name;
    }
  },
  {
    name: 'Abba Chinomso',
    avatar: 'avatar-2.png',
    get id() {
      return this.name;
    }
  },
  {
    name: 'Sunday Power',
    avatar: 'avatar-1.png',
    get id() {
      return this.name;
    }
  }
];

window.addEventListener('popstate', (e) => {
  let { chat, name, id, type: _type } = queryString.parse(
    window.location.search
  );
  let type: 'conversation' | 'classroom' =
    _type === CONVO_CHAT_TYPE ? CONVO_CHAT_TYPE : ROOM_CHAT_TYPE;

  name = String(name ?? placeHolderChatName);
  id = String(id ?? '');

  const currentChat = getState().chatsMessages[id];
  const avatar = currentChat?.avatar ?? '';

  if (chat) {
    if (chat === 'open') {
      dispatch(
        setActiveChat({
          name,
          avatar,
          type,
          id,
          isOpen: true,
          isMinimized: false
        })
      );
    } else {
      dispatch(
        setActiveChat({
          name,
          avatar,
          type,
          id,
          isOpen: true,
          isMinimized: true
        })
      );
    }
  } else {
    dispatch(
      setActiveChat({
        name,
        avatar,
        id,
        type: CONVO_CHAT_TYPE,
        isOpen: false,
        isMinimized: false
      })
    );
  }
});

const ChatBox = (props: any) => {
  const { activeChat } = props;
  const {
    name: activeChatName,
    avatar: activeChatAvatar,
    queryString: activeChatQString,
    type: activeChatType,
    isOpen,
    id: activeChatId,
    isMinimized
  }: Chat = activeChat;
  const { chatsMessages } = props;

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);

  const handleMinimizeChatClick = useCallback(() => {
    const {
      name,
      type,
      avatar,
      id,
      isMinimized,
      queryString: qString
    } = activeChat;
    const queryString = qString!.replace(
      isMinimized ? 'chat=min' : 'chat=open',
      isMinimized ? 'chat=open' : 'chat=min'
    );

    dispatch(
      setActiveChat({
        name,
        type,
        avatar,
        id,
        isMinimized: !isMinimized,
        queryString
      })
    );
    window.history.replaceState({}, '', window.location.pathname + queryString);
  }, [activeChat]);

  const handleCloseChatClick = useCallback(() => {
    const queryString = window.location.search;
    const { name, type, avatar, id } = activeChat;

    dispatch(
      setActiveChat({ name, type, avatar, id, isOpen: false, queryString })
    );
    window.history.pushState({}, '', window.location.pathname);
  }, [activeChat]);

  const handleOpenChatClick = useCallback(() => {
    const {
      name,
      type,
      avatar,
      id,
      isMinimized,
      queryString: qString
    } = activeChat;
    const queryString = /chat=/.test(String(qString))
      ? qString
      : `?chat=${
          isMinimized ? 'min' : 'open'
        }&type=${type}&id=${id}&name=${name}`;

    dispatch(
      setActiveChat({ name, type, avatar, id, isOpen: true, queryString })
    );
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [activeChat]);

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
    dispatch(
      setChatsMessages({
        name: activeChatName,
        avatar: activeChatAvatar,
        id: activeChatId,
        messages: [msg]
      })
    );
    setScrollViewElevation('calc(19px - 1.25rem)');

    window.setTimeout(() => {
      const timestamp = timestampFormatter();
      const msg: Message = {
        type: 'incoming',
        text:
          'A sample response from the end user via the server (web socket)...',
        timestamp
      };

      dispatch(
        setChatsMessages({
          name: activeChatName,
          avatar: activeChatAvatar,
          messages: [msg],
          id: activeChatId
        })
      );
    }, 2000);
  }, [msgBoxRowsMax, activeChatName, activeChatAvatar, activeChatId]);

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

  let _activeChatMessages = chatsMessages[activeChatId];
  useEffect(() => {
    if (!!_activeChatMessages && scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [_activeChatMessages, scrollView]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, isMinimized]);

  const _currentChat = chatsMessages[activeChatId];
  useEffect(() => {
    const { search } = window.location;
    let { chat, type: _type, id, name } = queryString.parse(search);
    let type: 'conversation' | 'classroom' =
      _type === CONVO_CHAT_TYPE ? CONVO_CHAT_TYPE : ROOM_CHAT_TYPE;

    name = String(name ?? placeHolderChatName);
    id = String(id ?? '');

    const currentChat = _currentChat;
    const avatar = currentChat?.avatar ?? '';
    
    dispatch(
      setActiveChat({
        name: name || activeChatName,
        type: type || activeChatType,
        avatar: avatar,
        id: id || activeChatId,
        queryString: !!chat ? search : activeChatQString,
        isOpen: !!chat || isOpen
      })
    );
  }, [
    activeChatName,
    activeChatType,
    activeChatAvatar,
    activeChatId,
    activeChatQString,
    isOpen,
    _currentChat
  ]);

  useEffect(() => {
    let storageChatsMessages: any;
    let activeChatLastMessage: Message[] = [];
    let id = activeChatId;

    if (cookieEnabled) {
      storageChatsMessages = localStorage.chatsMessages;

      if (storageChatsMessages) {
        storageChatsMessages = JSON.parse(storageChatsMessages);
        activeChatLastMessage =
          storageChatsMessages[id]?.messages.slice(-1) ?? [];
      }
    }

    if (!!activeChatLastMessage[0]) {
      //set "text: ''" here to prevent duplicate message from appending since it's most likely coming from localStorage and not the user sending it; also see 'chat.ts' in the 'actions' directory for the code that does the prevention
      dispatch(
        setChatsMessages({
          name: activeChatName,
          avatar: activeChatAvatar,
          id: activeChatId,
          messages: [{ ...activeChatLastMessage[0], text: '' }]
        })
      );
    }
  }, [activeChatName, activeChatAvatar, activeChatId]);

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
                        className='chat-avatar'
                        alt={activeChatName}
                        src={`/images/${activeChatAvatar}`}
                      />
                    </Badge>{' '}
                    <Col as='span' className='ml-2 p-0'>
                      {activeChatName ?? placeHolderChatName}
                    </Col>
                  </>
                ) : !activeChatId ? (
                  <Col as='span' className='ml-2 p-0'>
                    {activeChatName ?? placeHolderChatName}
                  </Col>
                ) : (
                  <>
                    <Avatar
                      component='span'
                      className='chat-avatar'
                      alt='Emmanuel Sunday'
                      src={`/images/${activeChatAvatar}`}
                    />
                    <Col as='span' className='ml-2 p-0'>
                      {activeChatName ?? placeHolderChatName}
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
            </Col>

            <Memoize
              memoizedComponent={{
                component: Grid,
                ref: scrollViewRef
              }}
              component='section'
              className='chat-scroll-view custom-scroll-bar d-flex flex-column col'
              style={{ marginBottom: scrollViewElevation }}>
              {!!chatsMessages[activeChatId]?.messages ? (
                chatsMessages[
                  activeChatId
                ].messages.map((message: Message, key: number) =>
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
                !activeChatId ? 'hide' : 'show'
              }`}>
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
          </Col>

          <Col
            as='section'
            md={3}
            className='chat-right-pane d-flex flex-column p-0'>
            <ChatRightPane participants={participants} type={activeChatType} />
          </Col>
        </Row>

        <IconButton
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
      <Col
        as='header'
        className='chat-header d-flex flex-column justify-content-center'>
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
    activeChat: state.activeChat,
    chatsMessages: state.chatsMessages
  };
};

export default connect(mapStateToProps)(ChatBox);
