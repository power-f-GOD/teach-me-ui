import React, {
  useState,
  useCallback,
  useEffect,
  createRef,
  useRef,
  useMemo
} from 'react';
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
import {
  setActiveChat,
  setChatsMessages,
  getUsersEnrolledInInstitution
} from '../../actions/chat';
import {
  Chat,
  Message,
  AnchorInfo,
  UserInfo
} from '../../constants/interfaces';
import { CONVO_CHAT_TYPE, ROOM_CHAT_TYPE } from '../../constants/chat';
import ChatLeftPane from './ChatLeftPane';
import { userDeviceIsMobile } from '../..';
import ChatRightPane from './ChatRightPane';

const msgBoxRef = createRef<HTMLInputElement>();
const scrollViewRef = createRef<HTMLElement>();
const msgBoxInitHeight = 19;

const Memoize = createMemo();

const cookieEnabled = navigator.cookieEnabled;

const placeHolderChatName = 'Start a new Conversation';

const rooms: Chat[] = [
  {
    anchor: {
      displayName: 'Room 1',
      type: ROOM_CHAT_TYPE,
      avatar: '',
      get id() {
        return this.displayName;
      },
      info: {}
    }
  },
  {
    anchor: {
      displayName: 'Room 2',
      type: ROOM_CHAT_TYPE,
      avatar: '',
      get id() {
        return this.displayName;
      },
      info: {}
    }
  },
  {
    anchor: {
      displayName: 'Room 3',
      type: ROOM_CHAT_TYPE,
      avatar: '',
      get id() {
        return this.displayName;
      },
      info: {}
    }
  }
];

window.addEventListener('popstate', (e) => {
  let { chat, name: displayName, id, type: _type } = queryString.parse(
    window.location.search
  );
  let type: 'conversation' | 'classroom' =
    _type === CONVO_CHAT_TYPE ? CONVO_CHAT_TYPE : ROOM_CHAT_TYPE;

  displayName = String(displayName ?? placeHolderChatName);
  id = String(id ?? '');

  const currentChat = getState().chatsMessages[id];
  const avatar = currentChat?.avatar ?? '';
  const info = currentChat?.info ?? {};

  if (chat) {
    if (chat === 'open') {
      dispatch(
        setActiveChat({
          anchor: {
            displayName,
            avatar,
            type,
            id,
            info
          },
          isOpen: true,
          isMinimized: false
        })
      );
    } else {
      dispatch(
        setActiveChat({
          anchor: {
            displayName,
            avatar,
            type,
            id,
            info
          },
          isOpen: true,
          isMinimized: true
        })
      );
    }
  } else {
    dispatch(
      setActiveChat({
        anchor: {
          displayName,
          avatar,
          id,
          type: CONVO_CHAT_TYPE,
          info
        },
        isOpen: false,
        isMinimized: false
      })
    );
  }
});

const baseUrl = 'teach-me-services.herokuapp.com/api/v1';
let token: string = '';

if (cookieEnabled) {
  if (localStorage.kanyimuta) {
    token = JSON.parse(localStorage.kanyimuta)?.token;
  }
}

const ChatBox = (props: any) => {
  const {
    activeChat,
    usersEnrolledInInstitution
    // newConversation
  } = props;
  const {
    anchor: chatAnchor,
    queryString: activeChatQString,
    isOpen,
    isMinimized
  }: Chat = activeChat;
  const {
    displayName: activeChatName,
    avatar: activeChatAvatar,
    type: activeChatType,
    id: activeChatId,
    info
  } = chatAnchor;
  const { chatsMessages } = props;
  const { username, institution, department, level } = info as UserInfo;
  const activeChatInfo = useMemo(
    () => ({ username, institution, department, level }),
    [username, institution, department, level]
  );

  let conversationId: any = useRef('');
  let socketUrl: any = useRef('');
  let socket: any = useRef();

  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);

  const handleMinimizeChatClick = useCallback(() => {
    const { anchor, isMinimized, queryString: qString }: Chat = activeChat;
    const { displayName, type, avatar, id }: AnchorInfo = anchor;
    const queryString = qString!.replace(
      isMinimized ? 'chat=min' : 'chat=open',
      isMinimized ? 'chat=open' : 'chat=min'
    );

    dispatch(
      setActiveChat({
        anchor: {
          displayName,
          type,
          avatar,
          id,
          info: activeChatInfo
        },
        isMinimized: !isMinimized,
        queryString
      })
    );
    window.history.replaceState({}, '', window.location.pathname + queryString);
  }, [activeChat, activeChatInfo]);

  const handleCloseChatClick = useCallback(() => {
    const queryString = window.location.search;
    const { displayName, type, avatar, id }: AnchorInfo = chatAnchor;

    dispatch(
      setActiveChat({
        anchor: {
          displayName,
          type,
          avatar,
          id,
          info: activeChatInfo
        },
        isOpen: false,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname);
  }, [chatAnchor, activeChatInfo]);

  const handleOpenChatClick = useCallback(() => {
    const { anchor, isMinimized, queryString: qString }: Chat = activeChat;
    const { displayName, type, avatar, id } = anchor;
    const queryString = /chat=/.test(String(qString))
      ? qString
      : `?chat=${
          isMinimized ? 'min' : 'open'
        }&type=${type}&id=${id}&name=${displayName}`;

    dispatch(
      setActiveChat({
        anchor: {
          displayName,
          type,
          avatar,
          id,
          info: activeChatInfo
        },
        isOpen: true,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [activeChat, activeChatInfo]);

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
        displayName: activeChatName,
        avatar: activeChatAvatar,
        id: activeChatId,
        messages: [msg],
        type: activeChatType,
        info: activeChatInfo
      })
    );
    setScrollViewElevation('calc(19px - 1.25rem)');

    if (socket.current && socket.current.readyState === 1) {
      try {
        socket.current.send(JSON.stringify({ message: msg.text }));
        console.log('message:', msg.text, 'was sent.');
      } catch (e) {
        console.log('Error:', e, 'Message:', msg.text, 'failed to sent.');
      }
    }
  }, [
    msgBoxRowsMax,
    activeChatName,
    activeChatAvatar,
    activeChatId,
    activeChatInfo,
    activeChatType
  ]);

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
    if (!e.shiftKey && e.key === 'Enter' && !userDeviceIsMobile) {
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
      dispatch(getUsersEnrolledInInstitution()(dispatch));
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, isMinimized]);

  const _currentChat = chatsMessages[activeChatId];
  useEffect(() => {
    const search = window.location.search;
    let { chat, type: _type, id, name: displayName } = queryString.parse(
      search
    );
    let type: 'conversation' | 'classroom' =
      _type === CONVO_CHAT_TYPE ? CONVO_CHAT_TYPE : ROOM_CHAT_TYPE;

    displayName = String(displayName ?? placeHolderChatName);
    id = String(id ?? '');

    const currentChat = _currentChat;
    const avatar = currentChat?.avatar ?? '';
    // const info = currentChat?.info ?? {};

    dispatch(
      setActiveChat({
        anchor: {
          displayName: displayName || activeChatName,
          type: type || activeChatType,
          avatar,
          id: id || activeChatId,
          info: activeChatInfo
        },
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
    activeChatInfo,
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
          displayName: activeChatName,
          avatar: activeChatAvatar,
          id: activeChatId,
          messages: [{ ...activeChatLastMessage[0], text: '' }],
          type: activeChatType,
          info: activeChatInfo
        })
      );
    }
  }, [
    activeChatName,
    activeChatAvatar,
    activeChatId,
    activeChatInfo,
    activeChatType
  ]);

  useEffect(() => {
    conversationId.current = '5ee00363d0f6230017a3ba1d'; //newConversation.id;

    if (conversationId.current) {
      socketUrl.current = `wss://${baseUrl}/socket?pipe=chat&channel=${conversationId.current}&token=${token}`;
      socket!.current = new WebSocket(socketUrl.current);
      // console.log('from effect1')//, conversationId, chatMessages);

      socket.current.addEventListener('open', () => {
        console.log('socket connected!');
      });

      socket.current.addEventListener('error', (e: any) => {
        console.log('An error occurred while trying to connect.');
      });
    }
  }, []);

  // const lastMessage = chatsMessages[activeChatId]?.messages?.slice(-1)[0] ?? {};
  useEffect(() => {
    //, conversationId, chatMessages);
    // const lastMessage: Message = chatMessages?.messages?.slice(-1)[0] ?? {};
    console.log('this is before the onmessage handler');
    if (socket.current) {
      socket.current.addEventListener('message', (e: any) => {
        const data = JSON.parse(e.data);
        const { message, sender_id, date } = data;

        const timestamp = timestampFormatter(date);
        const msg: Message = {
          type: 'incoming',
          text: message,
          timestamp
        };

        if (sender_id !== activeChatId) {
          msg.text = '';
        }

        console.log(
          'data from message listener:',
          data,
          sender_id,
          '...',
          activeChatId
        );
        dispatch(
          setChatsMessages({
            displayName: activeChatName,
            avatar: activeChatAvatar,
            messages: [msg],
            id: activeChatId,
            type: activeChatType,
            info: activeChatInfo
          })
        );
      });
    }
  }, [
    activeChatName,
    activeChatAvatar,
    activeChatId,
    activeChatInfo,
    activeChatType
  ]);

  return (
    <Container fluid className='ChatBox p-0'>
      <Container className='chat-box-container'>
        <Row
          className={`chat-box-wrapper m-0 ${isMinimized ? 'minimize' : ''} ${
            isOpen ? '' : 'close'
          }`}>
          <Col as='section' md={3} className='chat-left-pane d-flex p-0'>
            <ChatLeftPane
              rooms={rooms}
              conversations={usersEnrolledInInstitution.data!}
            />
          </Col>

          <Col
            as='section'
            md={activeChatId ? 6 : 9}
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
                      className='offline'
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
                    {placeHolderChatName}
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
              className='chat-scroll-view custom-scroll-bar grey-scrollbar d-flex flex-column col'
              style={{ marginBottom: scrollViewElevation }}>
              {!!chatsMessages[activeChatId]?.messages && activeChatId ? (
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
          </Col>

          {activeChatId && (
            <Col
              as='section'
              md={3}
              className='chat-right-pane d-flex flex-column p-0'>
              <ChatRightPane activeChat={activeChat} />
            </Col>
          )}
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
    chatsMessages: state.chatsMessages,
    usersEnrolledInInstitution: state.usersEnrolledInInstitution,
    newConversation: state.newConversation
  };
};

export default connect(mapStateToProps)(ChatBox);
