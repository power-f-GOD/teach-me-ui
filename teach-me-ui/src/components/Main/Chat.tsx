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
  getConversations,
  getConversationMessages,
  conversation,
  getConversationInfo,
  conversationInfo
} from '../../actions/chat';
import {
  ChatState,
  ConversationInfo,
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
import { userDeviceIsMobile } from '../..';
import { getState } from '../../appStore';

export const placeHolderDisplayName = 'Start a Conversation';

interface ChatBoxProps {
  conversation: APIConversationResponse;
  conversations: SearchState;
  chatState: ChatState;
  conversationMessages: SearchState;
  conversationInfo: ConversationInfo;
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

  const { chat, id: userId, cid } = queryString.parse(window.location.search);

  if (window.innerWidth < 992 && chat) {
    dispatch(conversation(''));
    dispatch(conversationInfo({ data: {} }));
    dispatch(conversationMessages({ data: [] }));
    delay(300).then(() => {
      dispatch(
        chatState({
          isOpen: false,
          isMinimized: false,
          queryString: ''
        })
      );
    });
    window.history.replaceState({}, '', window.location.pathname);

    return;
  }

  //for the sake of the (smooth) animation
  if (/min|open/.test(chat) && chatBoxWrapperRef.current) {
    chatBoxWrapperRef.current.style.display = 'flex';
  }

  if (!isNaN(cid) || cid === '0') {
    dispatch(conversationInfo({ status: 'settled', data: {} }));
    dispatch(conversation(''));
    dispatch(conversationMessages({ status: 'settled', data: [] }));
  } else {
    dispatch(conversationInfo({ user_typing: '' }));

    if (window.navigator.onLine) {
      dispatch(getConversationInfo(userId)(dispatch));
      dispatch(
        getConversationMessages(cid, 'pending', 'loading new')(dispatch)
      );
    } else {
      dispatch(
        conversationInfo({
          status: 'settled',
          err: true,
          online_status: 'OFFLINE'
        })
      );
      dispatch(
        conversationMessages({ status: 'pending', err: true, data: [] })
      );
    }
    dispatch(conversation(cid));
  }

  delay(500).then(() => {
    dispatch(
      chatState({
        isOpen: !!chat,
        isMinimized: chat === 'min',
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
    conversationInfo: _conversationInfo,
    userData,
    webSocket: socket
  } = props;
  const { isOpen, isMinimized, queryString: qString }: ChatState = _chatState;
  const {
    _id: convoId,
    associated_username: convoAssocUsername,
    participants: convoParticipants,
    friendship: convoFriendship,
    type: convoType,
    conversation_name: convoDisplayName,
    avatar: convoAvatar,
    unread_count: convoUnreadCount,
    last_read: convoLastReadDate
  } = _conversation;
  const {
    data: convoMessages,
    err: convoMessagesErr,
    status: convoMessagesStatus,
    statusText: convoMessagesStatusText
  } = _conversationMessages;
  const {
    err: convoInfoErr,
    status: convoInfoStatus,
    data: convoInfoData,
    new_message: convoInfoNewMessage,
    online_status: convoInfoOnlineStatus,
    user_typing: convoUserTyping
  } = _conversationInfo;
  const {
    err: convosErr,
    status: convosStatus,
    data: convosData
  } = conversations;
  const convoInfoLastSeen = convoInfoData?.last_seen;
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

  const handleSetActivePaneIndex = useCallback(
    (index: number) => () => {
      setActivePaneIndex(index);

      if (index === 1 && windowWidth < 992) {
        window.history[userDeviceIsMobile ? 'replaceState' : 'pushState'](
          {},
          '',
          window.location.pathname +
            window.location.search.replace('=min', '=open')
        );
      }
    },
    [windowWidth]
  );

  const scrollViewProviderValue = useMemo(() => {
    return {
      convoMessagesErr,
      convoMessagesStatusText,
      convoParticipants,
      convoInfoNewMessage,
      convoUnreadCount,
      convoLastReadDate
    };
  }, [
    convoMessagesErr,
    convoMessagesStatusText,
    convoParticipants,
    convoInfoNewMessage,
    convoUnreadCount,
    convoLastReadDate
  ]);

  const middlePaneHeaderProviderValue = useMemo(() => {
    return {
      chatState: _chatState,
      convoInfoData,
      convoAvatar,
      convoType,
      convoInfoStatus,
      convoUserTyping,
      handleSetActivePaneIndex
    };
  }, [
    _chatState,
    convoInfoData,
    convoAvatar,
    convoType,
    convoInfoStatus,
    convoUserTyping,
    handleSetActivePaneIndex
  ]);

  const colleagueNameAndStatusContextValue = React.useMemo(() => {
    return {
      convoId,
      convoDisplayName,
      convoAvatar,
      convoType,
      convoInfoStatus,
      convoUserTyping,
      convoInfoLastSeen
    };
  }, [
    convoId,
    convoDisplayName,
    convoAvatar,
    convoType,
    convoInfoStatus,
    convoUserTyping,
    convoInfoLastSeen
  ]);

  const handleOpenChatClick = useCallback(() => {
    const queryString = `?chat=${
      windowWidth < 992 ? 'min' : 'open'
    }&id=${placeHolderDisplayName}&cid=0`;

    setActivePaneIndex(0);
    setVisibilityState('visible');

    //delay till chatBox display property is set for animation to work
    delay(150).then(() => {
      dispatch(
        chatState({
          isOpen: true,
          isMinimized: false,
          queryString
        })
      );
    });
    window.history[userDeviceIsMobile ? 'replaceState' : 'pushState'](
      {},
      '',
      window.location.pathname + queryString
    );
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

  useEffect(() => {
    const search = `?chat=open&id=${placeHolderDisplayName}&cid=0`;

    if (/chat=/.test(window.location.search)) {
      window.history.replaceState({}, '', window.location.pathname + search);
    }

    window.onresize = (e: any) => setWindowWidth(e.target.innerWidth);
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
      if ((chat && chat === 'open') || (isOpen && !isMinimized)) {
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
        const queryString = `?chat=${
          windowWidth < 992 ? 'min' : 'open'
        }&id=${placeHolderDisplayName}&cid=0`;

        window.history.replaceState(
          {},
          '',
          window.location.pathname + queryString
        );
      }
    });

    if (!isOpen) {
      //delay till chatBox display property is set for animation to work
      delay(750).then(() => {
        let { chat } = queryString.parse(window.location.search);

        if (chat)
          dispatch(
            chatState({
              queryString: !!chat ? window.location.search : qString,
              isOpen: true,
              isMinimized: chat === 'min' && !(windowWidth < 992)
            })
          );
      });
    }

    if (chat && !convosLength && !convosErr && convosStatus !== 'fulfilled') {
      dispatch(getConversations()(dispatch));
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
    convoInfoStatus,
    convoInfoErr,
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
            userFirstname={userData.firstname}
            handleSetActivePaneIndex={handleSetActivePaneIndex}
          />
        </Col>

        <Col
          as='section'
          lg={convoAssocUsername ? 6 : 9}
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
                  convoAssocUsername={convoAssocUsername}
                  convoInfoOnlineStatus={convoInfoOnlineStatus}
                  convoMessages={convoMessages}
                  convoMessagesStatus={convoMessagesStatus}
                  chatState={_chatState}
                  webSocket={socket}
                />
              </ScrollViewContext.Provider>
            </ColleagueNameAndStatusContext.Provider>
          </MiddlePaneHeaderContext.Provider>
        </Col>

        {convoAssocUsername && (
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
              convoInfoErr={convoInfoErr}
              convoInfoData={convoInfoData}
              convoDisplayName={convoDisplayName}
              convoAvatar={convoAvatar}
              convoAssocUsername={convoAssocUsername}
              handleSetActivePaneIndex={handleSetActivePaneIndex}
            />
          </Col>
        )}
      </Row>

      <IconButton
        className={`chat-button ${unopened_count ? 'ripple' : ''} ${
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
    conversationInfo: state.conversationInfo,
    userData: state.userData,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(ChatBox);
