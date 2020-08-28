import React, { useCallback, useEffect, createRef } from 'react';
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
import ChatMiddlePane from './Chat.MiddlePane';
import ChatRightPane from './Chat.RightPane';
import createMemo from '../../Memo';

export const placeHolderDisplayName = 'Start a new Conversation';

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

const Memoize = createMemo();

window.addEventListener('popstate', () => {
  let { chat, id: userId, cid } = queryString.parse(window.location.search);

  //for the sake of the smooth animation
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
    associated_username: convoUsername,
    associated_user_id: convoUid
  } = _conversation;
  const { chat } = queryString.parse(window.location.search);
  const unopened_count = conversations.data?.reduce(
    (a, conversation: APIConversationResponse) =>
      a + (conversation.unread_count ? 1 : 0),
    0
  );

  const [visibilityState, setVisibilityState] = React.useState<
    'visible' | 'hidden'
  >(isOpen || chat ? 'visible' : 'hidden');

  const handleOpenChatClick = useCallback(() => {
    const queryString = `?chat=open&id=${
      convoUid ?? placeHolderDisplayName
    }&cid=${convoId ?? '0'}`;

    setVisibilityState('visible');

    //delay till chatBox display property is set for animation to work
    delay(150).then(() => {
      dispatch(
        chatState({
          isOpen: true,
          queryString
        })
      );
    });
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [convoId, convoUid]);

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

  useEffect(() => {
    const search = window.location.search;
    let { chat, id, cid } = queryString.parse(search);

    if (!isOpen) {
      //delay till chatBox display property is set for animation to work
      delay(750).then(() => {
        let { chat } = queryString.parse(search);

        if (chat)
          dispatch(
            chatState({
              queryString: !!chat ? search : qString,
              isOpen: true,
              isMinimized: chat === 'min'
            })
          );
      });
    }

    if (
      (isOpen || chat === 'open') &&
      !conversations.data![0] &&
      !conversations.err &&
      conversations.status !== 'fulfilled'
    ) {
      dispatch(getConversations()(dispatch));
    }

    if (cid && isNaN(cid)) {
      let infoStatus = _conversationInfo.status;

      if (
        window.navigator.onLine &&
        !_conversationInfo.err &&
        !convoId &&
        (infoStatus === 'settled' ||
          (infoStatus === 'fulfilled' && convoId !== cid))
      ) {
        dispatch(getConversationInfo(id)(dispatch));
      }

      if (!convoId || convoId !== cid) {
        dispatch(conversation(cid));
      }

      let msgStatus = _conversationMessages.status;
      if (
        window.navigator.onLine &&
        !_conversationMessages.err &&
        !convoId &&
        (msgStatus === 'settled' ||
          (msgStatus === 'fulfilled' && convoId !== cid))
      ) {
        dispatch(getConversationMessages(cid, 'pending')(dispatch));
      }
    }
  }, [
    conversations.data,
    conversations.status,
    convoId,
    qString,
    isOpen,
    _conversationInfo.status,
    _conversationInfo.err,
    _conversationMessages.err,
    conversations.err,
    _conversationMessages.status
  ]);

  return (
    <Container fluid className='ChatBox p-0'>
      <Row
        ref={chatBoxWrapperRef}
        className={`chat-box-wrapper m-0 ${isMinimized ? 'minimize' : ''} ${
          isOpen ? '' : 'close'
        } ${visibilityState}`}>
        <Col as='section' md={3} sm={4} className='chat-left-pane p-0'>
          <Memoize
            memoizedComponent={ChatLeftPane}
            conversations={conversations}
            userId={userData.id}
            userFirstname={userData.firstname}
          />
        </Col>

        <Col
          as='section'
          md={convoUsername ? 6 : 9}
          sm={8}
          className='chat-middle-pane d-flex flex-column p-0'>
          <Memoize
            memoizedComponent={ChatMiddlePane}
            conversation={_conversation}
            conversationMessages={_conversationMessages}
            chatState={_chatState}
            userData={userData}
            conversationInfo={_conversationInfo}
            webSocket={socket}
          />
        </Col>

        {convoUsername && (
          <Col
            as='section'
            md={3}
            className='chat-right-pane d-flex flex-column p-0'>
            <Memoize
              memoizedComponent={ChatRightPane as React.FC}
              conversation={_conversation}
              convoInfo={_conversationInfo}
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