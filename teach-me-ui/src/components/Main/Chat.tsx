import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  createRef
} from 'react';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import Badge from '@material-ui/core/Badge';

import { dispatch, delay, addEventListenerOnce } from '../../functions';
import {
  chatState,
  conversationMessages,
  getConversationMessages,
  conversation
} from '../../actions/chat';
import {
  ChatState,
  UserData,
  SearchState,
  APIConversationResponse
} from '../../constants/interfaces';
import ChatLeftPane from './Chat.LeftPane';
import ChatMiddlePane, {
  MiddlePaneHeaderContext,
  ScrollViewContext,
  ColleagueNameAndStatusContext
} from './Chat.MiddlePane';
import ChatRightPane from './Chat.RightPane';
import createMemo from '../../Memo';
import { getState } from '../../appStore';

export const placeHolderDisplayName = 'Start a Conversation';

interface ChatBoxProps {
  conversation: APIConversationResponse;
  conversations: SearchState;
  chatState: ChatState;
  conversationMessages: SearchState;
  userData: UserData;
  webSocket: WebSocket;
  [key: string]: any;
}

const chatBoxWrapperRef = createRef<any>();
const leftPaneRef = createRef<any>();
const middlePaneRef = createRef<any>();
const rightPaneRef = createRef<any>();

const Memoize = createMemo();

window.addEventListener('popstate', () => {
  if (!getState().auth.isAuthenticated) {
    return;
  }

  const { chat, cid } = queryString.parse(window.location.search);

  if (window.innerWidth < 992 && chat) {
    dispatch(
      chatState({
        isOpen: false,
        isMinimized: false,
        queryString: ''
      })
    );
    dispatch(conversation(''));
    dispatch(conversationMessages({ data: [] }));
    window.history.replaceState({}, '', window.location.pathname);

    return;
  }

  //for the sake of the (smooth) animation
  if (/min|open/.test(chat) && chatBoxWrapperRef.current) {
    chatBoxWrapperRef.current.style.display = 'flex';
  }

  if (!isNaN(cid) || cid === '0') {
    dispatch(conversation(''));
    dispatch(conversationMessages({ status: 'settled', data: [] }));
  } else if (chat) {
    if (window.navigator.onLine) {
      // dispatch(getConversationInfo(userId)(dispatch));
      dispatch(
        getConversationMessages(cid, 'pending', 'loading new')(dispatch)
      );
    } else {
      dispatch(
        conversationMessages({ status: 'pending', err: true, data: [] })
      );
    }
    dispatch(conversation(cid, { user_typing: '' }));
  }

  delay(100).then(() => {
    dispatch(
      chatState({
        isOpen: !!chat,
        isMinimized: chat === 'm2',
        queryString: window.location.search
      })
    );
  });
});

const ChatBox = (props: ChatBoxProps) => {
  const {
    conversation: _conversation,
    conversations,
    chatState: _chatState,
    conversationMessages: _conversationMessages,
    // conversationInfo: _conversationInfo,
    userData,
    webSocket: socket
  } = props;
  const { isOpen, isMinimized, queryString: qString }: ChatState = _chatState;
  const {
    colleague,
    id: convoId,
    participants: convoParticipants,
    friendship: convoFriendship,
    type: convoType,
    conversation_name: convoDisplayName,
    unread_count: convoUnreadCount,
    last_read: convoLastReadDate,
    new_message: convoNewMessage,
    user_typing: convoUserTyping
  } = _conversation;
  const {
    last_seen: convoLastSeen,
    username: convoUsername,
    online_status: convoOnlineStatus,
    profile_photo: convoProfilePhoto
  } = colleague || {};
  const {
    data: convoMessages,
    err: convoMessagesErr,
    status: convoMessagesStatus,
    statusText: convoMessagesStatusText
  } = _conversationMessages;
  const {
    err: convosErr,
    status: convosStatus,
    data: convosData
  } = conversations;
  const { chat, id, cid } = queryString.parse(window.location.search);
  const unopened_count = conversations.data?.reduce(
    (a, conversation: APIConversationResponse) =>
      a + (conversation.unread_count ? 1 : 0),
    0
  );
  const leftPane = leftPaneRef.current;
  const middlePane = middlePaneRef.current;
  const rightPane = rightPaneRef.current;

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [visibilityState, setVisibilityState] = useState<'visible' | 'hidden'>(
    isOpen || chat ? 'visible' : 'hidden'
  );
  const [activePaneIndex, setActivePaneIndex] = useState<number>(0);
  const [onlineStatusString, setOnlineStatusString] = useState<string>('');

  const handleSetActivePaneIndex = useCallback(
    (index: number) => () => {
      setActivePaneIndex(index);

      if (index === 1 && windowWidth < 992) {
        window.history.replaceState(
          {},
          '',
          window.location.pathname +
            window.location.search.replace('=m2', '=o1')
        );
      }
    },
    [windowWidth]
  );

  const handleOpenChatClick = useCallback(() => {
    const queryString = `?id=${placeHolderDisplayName}&chat=${
      windowWidth < 992 ? 'm2' : 'o1'
    }&cid=0`;

    setActivePaneIndex(0);
    setVisibilityState('visible');

    //delay till chatBox display property is set for animation to work
    delay(100).then(() => {
      dispatch(
        chatState({
          isOpen: true,
          isMinimized: false,
          queryString
        })
      );
    });
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [windowWidth]);

  const handleChatTransitionEnd = useCallback(
    (e: any) => {
      const { currentTarget } = e;

      delay(100).then(() => {
        if (!queryString.parse(window.location.search).chat) {
          setVisibilityState('hidden');
        }

        if (isOpen) {
          if (isMinimized) {
            currentTarget
              .querySelectorAll('header ~ section')
              .forEach((section: any) => {
                section.inert = true;
              });
          } else {
            currentTarget
              .querySelectorAll('header ~ section')
              .forEach((section: any) => {
                section.inert = false;
              });
          }
        }
      });
    },
    [isOpen, isMinimized]
  );

  const scrollViewProviderValue = useMemo(() => {
    return {
      convoMessagesErr,
      convoMessagesStatusText,
      convoParticipants,
      convoNewMessage,
      convoUnreadCount,
      convoLastReadDate
    };
  }, [
    convoMessagesErr,
    convoMessagesStatusText,
    convoParticipants,
    convoNewMessage,
    convoUnreadCount,
    convoLastReadDate
  ]);

  const middlePaneHeaderProviderValue = useMemo(() => {
    return {
      chatState: _chatState,
      convoType,
      convoUserTyping,
      handleSetActivePaneIndex
    };
  }, [_chatState, convoType, convoUserTyping, handleSetActivePaneIndex]);

  const colleagueNameAndStatusContextValue = useMemo(() => {
    return {
      convoId,
      convoDisplayName,
      convoProfilePhoto,
      convoType,
      convoUserTyping,
      convoLastSeen,
      convosErr,
      setOnlineStatus: setOnlineStatusString
    };
  }, [
    convoId,
    convoDisplayName,
    convoProfilePhoto,
    convoType,
    convoUserTyping,
    convoLastSeen,
    convosErr,
    setOnlineStatusString
  ]);

  useEffect(() => {
    const search = `?id=${placeHolderDisplayName}&chat=o1&cid=0`;

    if (/chat=/.test(window.location.search)) {
      window.history.replaceState({}, '', window.location.pathname + search);
      props.location.search = search;
    }

    window.onresize = (e: any) => setWindowWidth(e.target.innerWidth);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isOpen || isMinimized || chat) {
      if (windowWidth < 992) {
        (leftPane ?? {}).inert = true;
        (middlePane ?? {}).inert = true;
        (rightPane ?? {}).inert = true;

        switch (activePaneIndex) {
          case 0:
            (leftPane ?? {}).inert = false;
            break;
          case 1:
            (middlePane ?? {}).inert = false;
            break;
          case 2:
            (rightPane ?? {}).inert = false;
            break;
        }
      } else {
        (leftPane ?? {}).inert = false;
        (middlePane ?? {}).inert = false;
        (rightPane ?? {}).inert = false;
      }
    }
  }, [
    leftPane,
    middlePane,
    rightPane,
    activePaneIndex,
    windowWidth,
    isOpen,
    chat,
    isMinimized
  ]);

  useEffect(() => {
    const chatBoxWrapper = chatBoxWrapperRef.current;

    if (chatBoxWrapper) {
      addEventListenerOnce(chatBoxWrapper, handleChatTransitionEnd);
    }
  }, [handleChatTransitionEnd]);

  useEffect(() => {
    const timeout = isMinimized ? 500 : 5;

    if (chat) {
      delay(timeout).then(() => setVisibilityState('visible'));
    }
  }, [isMinimized, chat]);

  useEffect(() => {
    delay(400).then(() => {
      if ((chat && chat === 'o1') || (isOpen && !isMinimized)) {
        document.body.style.overflow = 'hidden';
        document.querySelectorAll('.Main > *').forEach((component: any) => {
          if (!/ChatBox/.test(component.className)) {
            component.inert = true;
          }
        });
      } else {
        document.body.style.overflow = 'auto';
        document.querySelectorAll('.Main > *').forEach((component: any) => {
          if (!/ChatBox/.test(component.className)) {
            component.inert = false;
          }
        });
      }
    });
  }, [isOpen, isMinimized, chat]);

  const convosLength = convosData?.length;
  useEffect(() => {
    delay(500).then(() => {
      let { cid, chat } = queryString.parse(window.location.search);
      if (
        ((!isNaN(cid) && cid) || !convoId) &&
        chat &&
        isOpen &&
        windowWidth < 992
      ) {
        const queryString = `?id=${placeHolderDisplayName}&chat=${
          windowWidth < 992 ? 'm2' : 'o1'
        }&cid=0`;

        window.history.replaceState(
          {},
          '',
          window.location.pathname + queryString
        );
      }
    });

    if (!isOpen) {
      //delay till chatBox display property is set for animation to work
      delay(150).then(() => {
        let { chat } = queryString.parse(window.location.search);

        if (chat)
          dispatch(
            chatState({
              queryString: !!chat ? window.location.search : qString,
              isOpen: true,
              isMinimized: chat === 'm2' && !(windowWidth < 992)
            })
          );
      });
    }
  }, [
    convosLength,
    convosStatus,
    convoId,
    qString,
    isOpen,
    chat,
    id,
    cid,
    windowWidth,
    convoMessagesErr,
    convosErr,
    convoMessagesStatus
  ]);

  return (
    <Container fluid className='ChatBox p-0'>
      <Row
        ref={chatBoxWrapperRef}
        className={`chat-box-wrapper m-0 ${isMinimized ? 'minimize' : ''} ${
          isOpen ? '' : 'close'
        } ${visibilityState}`}>
        <Col
          as='section'
          lg={3}
          className={`chat-left-pane ${
            activePaneIndex === 0 ? 'active-pane ' : ''
          }p-0`}
          ref={leftPaneRef}>
          <Memoize
            memoizedComponent={ChatLeftPane}
            conversations={conversations}
            userId={userData.id}
            userFirstname={userData.first_name}
            handleSetActivePaneIndex={handleSetActivePaneIndex}
          />
        </Col>

        <Col
          as='section'
          lg={convoId ? 6 : 9}
          className={`chat-middle-pane ${
            activePaneIndex === 1 ? 'active-pane ' : ''
          }d-flex flex-column p-0 `}
          ref={middlePaneRef}>
          <MiddlePaneHeaderContext.Provider
            value={middlePaneHeaderProviderValue}>
            <ColleagueNameAndStatusContext.Provider
              value={colleagueNameAndStatusContextValue}>
              <ScrollViewContext.Provider value={scrollViewProviderValue}>
                <Memoize
                  memoizedComponent={ChatMiddlePane}
                  userData={userData}
                  convoDisplayName={convoDisplayName}
                  convoId={convoId}
                  convoFriendship={convoFriendship}
                  convoUsername={convoUsername}
                  convoOnlineStatus={convoOnlineStatus}
                  convoMessages={convoMessages}
                  convoMessagesStatus={convoMessagesStatus}
                  activePaneIndex={activePaneIndex}
                  chatState={_chatState}
                  webSocket={socket}
                />
              </ScrollViewContext.Provider>
            </ColleagueNameAndStatusContext.Provider>
          </MiddlePaneHeaderContext.Provider>
        </Col>

        {convoId && (
          <Col
            as='section'
            lg={3}
            ref={rightPaneRef}
            className={`chat-right-pane ${
              activePaneIndex === 2 ? 'active-pane ' : ''
            }d-flex flex-column p-0`}>
            <Memoize
              memoizedComponent={ChatRightPane}
              convoType={convoType}
              convosErr={convosErr}
              convoInfo={colleague}
              convoDisplayName={convoDisplayName}
              convoProfilePhoto={convoProfilePhoto}
              convoUsername={convoUsername}
              onlineStatusString={onlineStatusString}
              handleSetActivePaneIndex={handleSetActivePaneIndex}
            />
          </Col>
        )}
      </Row>

      <IconButton
        className={`chat-open-button ${unopened_count ? 'ripple' : ''} ${
          isOpen ? 'hide' : ''
        }`}
        onClick={handleOpenChatClick}
        aria-label='chat'>
        <Badge badgeContent={unopened_count} color='error'>
          <ChatIcon fontSize='inherit' />
        </Badge>
      </IconButton>
    </Container>
  );
};

const mapStateToProps = (state: any) => {
  return {
    chatState: state.chatState,
    conversation: state.conversation,
    conversations: state.conversations,
    conversationMessages: state.conversationMessages,
    conversationsMessages: state.conversationsMessages,
    conversationInfo: state.conversationInfo,
    userData: state.userData,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(ChatBox);
