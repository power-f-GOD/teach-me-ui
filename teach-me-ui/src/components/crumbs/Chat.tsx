import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';

import { dispatch } from '../../functions';
import {
  chatState,
  conversationMessages,
  getConversations,
  getConversationMessages,
  conversation,
  getConversationInfo
} from '../../actions/chat';
import {
  ChatState,
  ConversationInfo,
  UserData,
  UserEnrolledData,
  SearchState,
  APIConversationResponse,
  APIMessageResponse
} from '../../constants/interfaces';
import ChatLeftPane from './Chat.LeftPane';
import ChatMiddlePane from './Chat.MiddlePane';
import ChatRightPane from './Chat.RightPane';

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

window.addEventListener('popstate', () => {
  let { chat } = queryString.parse(window.location.search);

  dispatch(
    chatState({
      queryString: window.location.search,
      isOpen: /min|open/.test(chat),
      isMinimized: chat === 'min'
    })
  );
});

const ChatBox = (props: ChatBoxProps) => {
  const {
    conversation: _conversation,
    conversations,
    chatState: _chatState,
    conversationMessages: _conversationMessages,
    conversationInfo,
    userData,
    webSocket: socket
  } = props;
  const { isOpen, isMinimized, queryString: qString }: ChatState = _chatState;
  const { _id: convoId, associated_username: convoUsername } = _conversation;

  const handleOpenChatClick = useCallback(() => {
    const queryString = `?chat=open&id=${
      convoUsername ?? placeHolderDisplayName
    }&cid=${convoId ?? '0'}`;

    dispatch(
      chatState({
        isOpen: true,
        queryString
      })
    );
    window.history.pushState({}, '', window.location.pathname + queryString);

    if (!conversations.data![0]) {
      dispatch(getConversations()(dispatch));
    }
  }, [convoId, convoUsername, conversations.data]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const search = window.location.search;
    let { chat, id, cid } = queryString.parse(search);

    if (chat) {
      dispatch(
        chatState({
          queryString: !!chat ? search : qString,
          isOpen: true,
          isMinimized: chat === 'min'
        })
      );
    }

    if (isOpen && !conversations.data![0]) {
      dispatch(getConversations()(dispatch));
    }

    if (cid && isNaN(cid)) {
      let infoStatus = conversationInfo.status;
      if (
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
        convoId &&
        (msgStatus === 'settled' ||
          (msgStatus === 'fulfilled' && convoId !== cid))
      ) {
        dispatch(getConversationMessages(cid)(dispatch));
      }
    }
  }, [
    conversationInfo.status,
    conversations.data,
    convoId,
    qString,
    isOpen,
    _conversationMessages.status
  ]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', (e: any) => {
        const message = JSON.parse(e.data) as APIMessageResponse;
        const { pipe } = message;

        if (pipe === 'CHAT_NEW_MESSAGE') {
          // console.log(message);
          dispatch(conversationMessages({ data: [{ ...message }] }));
        }
      });
    }
  }, [socket]);

  return (
    <Container fluid className='ChatBox p-0'>
      <Row
        className={`chat-box-wrapper m-0 ${isMinimized ? 'minimize' : ''} ${
          isOpen ? '' : 'close'
        }`}>
        <Col as='section' md={3} className='chat-left-pane p-0'>
          <ChatLeftPane conversations={conversations} />
        </Col>

        <Col
          as='section'
          md={convoUsername ? 6 : 9}
          className='chat-middle-pane d-flex flex-column p-0'>
          <ChatMiddlePane
            conversation={_conversation}
            conversationMessages={_conversationMessages}
            chatState={_chatState}
            userData={userData}
            conversationInfo={conversationInfo}
            webSocket={socket}
          />
        </Col>

        {convoUsername && (
          <Col
            as='section'
            md={3}
            className='chat-right-pane d-flex flex-column p-0'>
            <ChatRightPane
              conversation={_conversation}
              convoInfo={
                conversationInfo.data as Partial<
                  APIConversationResponse & UserEnrolledData
                >
              }
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
