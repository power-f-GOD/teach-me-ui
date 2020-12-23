import React, { useState, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { dispatch } from '../../../functions';
import {
  chatState,
  conversationMessages,
  getConversationMessages,
  conversation,
  conversationsMessages
} from '../../../actions/chat';
import {
  ChatState,
  UserData,
  SearchState,
  APIConversationResponse,
  AuthState
} from '../../../constants/interfaces';
import ChatLeftPane from './LeftPane';
import ChatMiddlePane from './MiddlePane';
import ChatRightPane from './RightPane';
import createMemo from '../../../Memo';
import { getState } from '../../../appStore';
import { Redirect, match } from 'react-router-dom';
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
  userData: UserData;
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

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [activePaneIndex, setActivePaneIndex] = useState<number>(0);
  const [onlineStatusString, setOnlineStatusString] = useState<string>('');
  const [shouldGoBackToHome, setShouldGoBackToHome] = useState<boolean>(false);

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
    dispatch(
      chatState({ pathname: location.pathname, queryParam: location.search })
    );
  }, [location.search, location.pathname]);

  useEffect(() => {
    if (windowWidth < 992) {
      const index = parseInt(queryParamVal!);

      if (+index >= 0) {
        setActivePaneIndex(index);
      }
    }
  }, [queryParamVal, windowWidth]);

  useEffect(() => {
    window.onpopstate = () =>
      setTimeout(() => {
        const cid = match.params.convoId;

        dispatch(
          chatState({
            pathname: window.location.pathname,
            queryParam: window.location.search
          })
        );

        if (windowWidth < 992) {
          if (queryParamVal === '0') {
            dispatch(
              conversationsMessages({
                convoId,
                statusText: 'replace messages',
                data: { [convoId]: [...getState().conversationMessages.data] }
              })
            );
            setShouldGoBackToHome(true);
            return;
          }
        } else {
          if (cid === '0') {
            dispatch(conversation(''));
            dispatch(conversationMessages({ data: [] }));
          } else {
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
        }
      }, 0);

    return () => {
      window.onpopstate = () => {};
    };
  }, [match, windowWidth, pathnameConvoId, queryParamVal, convoId]);

  useEffect(() => {
    const [pathname, queryParam] = ['/chat/0', '?0'];

    if (/chat/.test(location.pathname)) {
      props.location.pathname = pathname;
      props.location.search = queryParam;
    }

    document.body.style.overflow = 'hidden';
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

    window.onresize = (e: any) => {
      if (/chat/.test(window.location.pathname)) {
        setWindowWidth(e.target.innerWidth);
      }
    };

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
  }, []);

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
    // conversationInfo: state.conversationInfo,
    userData: state.userData,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(Chat);
