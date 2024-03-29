import React, { useState, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { dispatch, getNecessaryConversationData } from '../../../functions';
import {
  chatState,
  conversationMessages,
  conversation,
  conversationsMessages
} from '../../../actions/main/chat';
import {
  ChatState,
  UserData,
  SearchState,
  APIConversationResponse,
  AuthState
} from '../../../types';
import ChatLeftPane from './LeftPane';
import ChatMiddlePane from './MiddlePane';
import ChatRightPane from './RightPane';
import createMemo from '../../../Memo';
import { getState } from '../../../appStore';
import { Redirect, match, useHistory } from 'react-router-dom';
import {
  MiddlePaneHeaderContext,
  ColleagueNameAndStatusContext
} from './MiddlePane/Header';
import { ScrollViewContext } from './MiddlePane/ScrollView';

export const placeHolderDisplayName = 'Start a Conversation';

interface ChatProps {
  conversation: APIConversationResponse;
  conversations: SearchState;
  chatState: ChatState;
  conversationMessages: SearchState;
  conversationsMessages?: SearchState;
  userData: UserData;
  windowWidth: number;
  webSocket: WebSocket;
  location: Location;
  match: match<{ convoId: string }>;
  auth: AuthState;
}

export const Memoize = createMemo();

const chatBoxRef = createRef<any>();
const leftPaneRef = createRef<any>();
const middlePaneRef = createRef<any>();
const rightPaneRef = createRef<any>();

const Chat = (props: ChatProps) => {
  const {
    conversation: _conversation,
    conversations,
    chatState: _chatState,
    conversationMessages: _conversationMessages,
    // conversationInfo: _conversationInfo,
    userData,
    webSocket: socket,
    location,
    windowWidth,
    match
  } = props;
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
    err: convosErr
    // status: convosStatus,
  } = conversations;
  const { pathname, queryParam } = _chatState;
  const pathnameConvoId = pathname?.split('/').slice(-1)[0];
  const queryParamVal = queryParam?.slice(1);
  const leftPane = leftPaneRef.current;
  const middlePane = middlePaneRef.current;
  const rightPane = rightPaneRef.current;

  const [activePaneIndex, setActivePaneIndex] = useState<number>(0);
  const [onlineStatusString, setOnlineStatusString] = useState<string>('');
  const [shouldGoBackToHome, setShouldGoBackToHome] = useState<boolean>(false);
  const history = useHistory();

  const scrollViewProviderValue = useMemo(() => {
    return {
      convoMessagesErr,
      convoMessagesStatusText,
      convoParticipants,
      convoNewMessage,
      convoUnreadCount,
      convoLastReadDate,
      search: location.search
    };
  }, [
    convoMessagesErr,
    convoMessagesStatusText,
    convoParticipants,
    convoNewMessage,
    convoUnreadCount,
    convoLastReadDate,
    location.search
  ]);

  const middlePaneHeaderProviderValue = useMemo(() => {
    return {
      convoType,
      convoUserTyping,
      windowWidth
    };
  }, [windowWidth, convoType, convoUserTyping]);

  const colleagueNameAndStatusContextValue = useMemo(() => {
    return {
      convoId,
      convoDisplayName,
      convoProfilePhoto,
      convoType,
      convoUserTyping,
      convoLastSeen,
      convosErr,
      windowWidth,
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
    windowWidth,
    setOnlineStatusString
  ]);

  useEffect(() => {
    const isRef = /ref=/.test(location.search);
    const [pathname, queryParam] = [
      isRef ? location.pathname : '/chat/0',
      isRef ? location.search : '?0'
    ];

    if (/\/chat/.test(location.pathname) && !isRef) {
      history.replace(pathname + queryParam);
      document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.Main > *').forEach((component: any) => {
      if (!/ChatBox/.test(component.className)) {
        component.inert = true;
      }
    });
    dispatch(
      chatState({
        pathname,
        queryParam,
        isOpen: true
      })
    );

    return () => {
      document.body.style.overflow = 'auto';
      document.querySelectorAll('.Main > *').forEach((element: any) => {
        if (!/ChatBox/.test(element.className)) {
          element.inert = false;
        }
      });
      dispatch(
        chatState({
          pathname: '',
          isOpen: false,
          queryParam: ''
        })
      );
      dispatch(conversation(''));
      dispatch(conversationMessages({ data: [] }));
    };
    //eslint-disable-next-line
  }, [history]);

  useEffect(() => {
    dispatch(
      chatState({ pathname: location.pathname, queryParam: location.search })
    );

    // this block is for when the 'Chat with Colleague' button is clicked from 'Profile'
    if (
      !convoId &&
      /^\/chat\//.test(location.pathname) &&
      /ref=/.test(location.search)
    ) {
      setTimeout(() => {
        const convoId = window.location.pathname.split('/')[2];
        const userId = window.location.search.replace(/.*ref=(.*)&?.*/, '$1');

        if (userId && convoId !== '0') {
          getNecessaryConversationData({ extra: { convoId, userId }, history });
        }
      }, 300);
    }
  }, [location.search, location.pathname, convoId, history]);

  useEffect(() => {
    if (windowWidth < 992) {
      const index = parseInt(queryParamVal!);

      if (+index >= 0) {
        setActivePaneIndex(index);
      }
    }
  }, [queryParamVal, windowWidth]);

  useEffect(() => {
    window.onpopstate = () => {
      const { pathname, search } = window.location;
      const cid = windowWidth < 992 ? pathnameConvoId : pathname.split('/')[2];
      const viewIndex = windowWidth < 992 ? queryParamVal : search.slice(1);

      if (!convoId && cid !== '0') {
        history.replace('/chat/0?0/');
      }

      if (convoId) {
        dispatch(
          conversationsMessages({
            convoId,
            statusText: 'replace messages',
            data: { [convoId]: [...getState().conversationMessages.data] }
          })
        );
      }

      if (windowWidth < 992) {
        if (cid === '0' && viewIndex === '0') {
          setShouldGoBackToHome(true);
        }
      } else {
        history.replace('/chat/0?0/');
        dispatch(conversation(''));
        dispatch(conversationMessages({ data: [] }));
      }
    };

    return () => {
      window.onpopstate = () => {};
    };
  }, [match, windowWidth, pathnameConvoId, queryParamVal, convoId, history]);

  useEffect(() => {
    if (windowWidth < 992) {
      (leftPane ?? {}).inert = true;
      (middlePane ?? {}).inert = true;
      (rightPane ?? {}).inert = true;

      switch (activePaneIndex) {
        case 2:
          (rightPane ?? {}).inert = false;
          break;
        case 1:
          (middlePane ?? {}).inert = false;
          break;
        default:
          (leftPane ?? {}).inert = false;
          break;
      }
    } else {
      (leftPane ?? {}).inert = false;
      (middlePane ?? {}).inert = false;
      (rightPane ?? {}).inert = false;
    }
  }, [leftPane, middlePane, rightPane, activePaneIndex, windowWidth]);

  if (shouldGoBackToHome) {
    return <Redirect to='/' />;
  }

  return (
    <Row ref={chatBoxRef} className={`ChatBox m-0 fade-in`}>
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
        />
      </Col>

      <Col
        as='section'
        lg={convoId ? 6 : 9}
        className={`chat-middle-pane ${
          activePaneIndex === 1 ? 'active-pane ' : ''
        }d-flex flex-column p-0 `}
        ref={middlePaneRef}>
        <MiddlePaneHeaderContext.Provider value={middlePaneHeaderProviderValue}>
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
          />
        </Col>
      )}
    </Row>
  );
};

const mapStateToProps = (state: ChatProps) => {
  return {
    chatState: state.chatState,
    conversation: state.conversation,
    conversations: state.conversations,
    conversationMessages: state.conversationMessages,
    // conversationsMessages: state.conversationsMessages,
    // conversationInfo: state.conversationInfo,
    userData: state.userData,
    windowWidth: state.windowWidth,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(Chat);
