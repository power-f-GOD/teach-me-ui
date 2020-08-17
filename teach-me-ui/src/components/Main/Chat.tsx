import React, { useCallback, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';

import { dispatch, delay } from '../../functions';
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
  let { chat, cid } = queryString.parse(window.location.search);

  //for the sake of the smooth animation
  if (/min|open/.test(chat) && chatBoxWrapperRef.current) {
    chatBoxWrapperRef.current.style.display = 'flex';
  }

  if (!isNaN(cid)) {
    dispatch(conversationInfo({ status: 'settled', data: {} }));
    dispatch(conversation(''));
    dispatch(conversationMessages({ status: 'settled', data: [] }));
  }

  delay(5).then(() => {
    dispatch(
      chatState({
        queryString: window.location.search,
        isOpen: /min|open/.test(chat),
        isMinimized: chat === 'min'
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
  const { _id: convoId, associated_username: convoUsername } = _conversation;

  const [visibilityState, setVisibilityState] = React.useState<
    'visible' | 'hidden'
  >('hidden');

  const handleOpenChatClick = useCallback(() => {
    const queryString = `?chat=open&id=${
      convoUsername ?? placeHolderDisplayName
    }&cid=${convoId ?? '0'}`;

    setVisibilityState('visible');

    //delay till chatBox display property is set for animation to work
    delay(5).then(() => {
      dispatch(
        chatState({
          isOpen: true,
          queryString
        })
      );
    });
    window.history.pushState({}, '', window.location.pathname + queryString);
  }, [convoId, convoUsername]);

  const handleChatTransitionEnd = useCallback(
    (e: any) => {
      const { currentTarget } = e;

      delay(400).then(() => {
        if (!isOpen && !/chat=/.test(window.location.search)) {
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
      try {
        chatBoxWrapper.addEventListener(
          'transitionend',
          handleChatTransitionEnd,
          { once: true }
        );
      } catch (err) {
        chatBoxWrapper.removeEventListener(
          'transitionend',
          handleChatTransitionEnd
        );
        chatBoxWrapper.addEventListener(
          'transitionend',
          handleChatTransitionEnd
        );
      }
    }
  }, [handleChatTransitionEnd]);

  useEffect(() => {
    const timeout = isMinimized ? 500 : 5;

    if (/chat=open/.test(window.location.search) || isMinimized) {
      delay(timeout).then(() => setVisibilityState('visible'));
    }
  }, [isMinimized]);

  useEffect(() => {
    delay(400).then(() => {
      if (isOpen && !isMinimized) {
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
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const search = window.location.search;
    let { chat, id, cid } = queryString.parse(search);

    if (chat) {
      //delay till chatBox display property is set for animation to work
      delay(500).then(() => {
        dispatch(
          chatState({
            queryString: !!chat ? search : qString,
            isOpen: true,
            isMinimized: chat === 'min'
          })
        );
      });
    }

    if ((isOpen || chat === 'open') && !conversations.data![0]) {
      dispatch(getConversations()(dispatch));
    }

    if (cid && isNaN(cid)) {
      let infoStatus = _conversationInfo.status;

      if (
        window.navigator.onLine &&
        convoId &&
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
        convoId &&
        (msgStatus === 'settled' ||
          (msgStatus === 'fulfilled' && convoId !== cid))
      ) {
        dispatch(getConversationMessages(cid)(dispatch));
      }
    }
  }, [
    _conversationInfo.status,
    conversations.data,
    convoId,
    qString,
    isOpen,
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
        className={`chat-button ${isOpen ? 'hide' : ''}`}
        onClick={handleOpenChatClick}
        aria-label='chat'>
        <ChatIcon fontSize='inherit' />
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
