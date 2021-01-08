import React, { useState, useEffect, createRef } from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import ChatIcon from '@material-ui/icons/Chat';

import {
  ChatState,
  APIMessageResponse,
  UserData,
  Partial,
  OnlineStatus,
  FetchState
} from '../../../../constants/interfaces';
import { conversationMessages, conversations } from '../../../../actions/chat';
import {
  dispatch,
  emitUserOnlineStatus,
  loopThru
} from '../../../../functions/utils';
import {
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELIVERED
} from '../../../../constants/chat';
import { SelectedMessageValue } from '../crumbs';
import { MiddlePaneHeader } from './Header';
import { ScrollView } from './ScrollView';
import MessageBox from './MessageBox';
import { Memoize } from '..';

export interface ChatMiddlePaneProps {
  userData: UserData;
  chatState: ChatState;
  webSocket: WebSocket;
  search: string;
  windowWidth: number;
  chat: string;
  convoFriendship: string;
  convoParticipants: string[];
  convoId: string;
  convoUserTyping: string;
  convoType: string;
  convoDisplayName: string;
  convoProfilePhoto: string;
  convoUsername: string;
  convoUnreadCount: number;
  convoMessages: Partial<APIMessageResponse>[];
  convoMessagesErr: boolean;
  convoMessagesStatus: FetchState<APIMessageResponse>['status'];
  convoMessagesStatusText: string;
  convosErr: boolean;
  convoOnlineStatus: OnlineStatus;
  convoNewMessage: Partial<APIMessageResponse>;
  convoLastSeen: number;
  convoLastReadDate: number;
  activePaneIndex: number;
  setOnlineStatus: Function;
  (index: number): any;
}

export const messagesStatusInfoRef: any = createRef<HTMLInputElement | null>();
export let messagesStatusInfo: HTMLElement | null = null;

const ChatMiddlePane = (props: Partial<ChatMiddlePaneProps>) => {
  const {
    userData,
    convoDisplayName,
    convoId,
    convoFriendship,
    convoUsername,
    convoOnlineStatus,
    convoMessages: data,
    convoMessagesStatus,
    activePaneIndex,
    webSocket: socket
  } = props;
  const convoMessages = data as Partial<APIMessageResponse>[];
  const { pathname, search } = window.location;
  const [cid, queryParam] = [pathname.split('/').slice(-1)[0], search.slice(1)];

  const [selectedMessages, setSelectedMessages] = useState<{
    [id: string]: SelectedMessageValue;
  }>({});
  const [clearSelections, setClearSelections] = useState<boolean>(false);
  const [messageHead, setMessageHead] = useState<SelectedMessageValue | null>(
    null
  );

  useEffect(() => {
    messagesStatusInfo = messagesStatusInfoRef.current;
  }, []);

  useEffect(() => {
    if (
      +activePaneIndex! >= 0 &&
      !!convoMessages[0] &&
      userData?.online_status === 'ONLINE'
    ) {
      const isMinimized = queryParam !== '1';
      const isSameCid = convoId === cid;
      const userId = userData.id;

      if (isSameCid && !isMinimized) {
        dispatch(conversations({ data: [{ unread_count: 0, id: convoId }] }));
      }

      loopThru(
        convoMessages,
        (convoMessage): any => {
          const message = { ...convoMessage };

          if (!message.sender_id || userId === message.sender_id) {
            return;
          }

          const isSeen = message.seen_by?.includes(userId);

          if (isSeen) {
            return 'break';
          }

          try {
            if (socket && socket.readyState === 1 && isSameCid) {
              const isDelivered = message.delivered_to?.includes(userId);

              if (!isDelivered) {
                socket!.send(
                  JSON.stringify({
                    message_id: message.id,
                    pipe: CHAT_MESSAGE_DELIVERED
                  })
                );

                dispatch(
                  conversationMessages({
                    statusText: 'from socket',
                    pipe: CHAT_MESSAGE_DELIVERED,
                    data: [{ delivered_to: [userId], id: message.id }]
                  })
                );
              }

              if (!isMinimized) {
                socket!.send(
                  JSON.stringify({
                    message_id: message.id,
                    pipe: CHAT_READ_RECEIPT
                  })
                );
                dispatch(
                  conversationMessages({
                    statusText: 'from socket',
                    pipe: CHAT_READ_RECEIPT,
                    data: [{ seen_by: [userId], id: message.id }]
                  })
                );
              }
            } else return 'break';
          } catch (e) {
            emitUserOnlineStatus(false, true, {
              open: true,
              message:
                e +
                'An error occurred. Could not establish connection with server.',
              severity: 'error'
            });
            console.error('An error occurred. Error:', e);
            return 'break';
          }
        },
        { rightToLeft: true }
      );
    }
  }, [
    cid,
    convoId,
    queryParam,
    userData,
    convoMessages,
    convoOnlineStatus,
    activePaneIndex,
    socket
  ]);

  return (
    <>
      <Col as='header' className='chat-header d-flex p-0'>
        <Memoize
          memoizedComponent={MiddlePaneHeader}
          convoId={convoId}
          convoOnlineStatus={convoOnlineStatus}
          setMessageHead={setMessageHead}
          selectedMessages={selectedMessages}
          setClearSelections={setClearSelections}
          setSelectedMessages={setSelectedMessages}
          webSocket={socket}
        />
      </Col>

      <Memoize
        memoizedComponent={ScrollView}
        convoMessages={convoMessages}
        convoMessagesStatus={convoMessagesStatus}
        convoFriendship={convoFriendship}
        convoUsername={convoUsername}
        convoId={convoId}
        convoDisplayName={convoDisplayName}
        username={userData?.username as string}
        userId={userData?.id as string}
        clearSelections={clearSelections}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
      />
      <Box className='scroll-bar-fader' />

      <Container
        fluid
        className='theme-tertiary d-flex align-items-center justify-content-center messages-status-signal h-100'
        ref={messagesStatusInfoRef}>
        {convoMessagesStatus === 'fulfilled' &&
        !convoMessages.length &&
        convoId ? (
          <Box fontSize='1.1rem' textAlign='center' maxWidth='100%'>
            <ChatIcon fontSize='large' />
            <br />
            No messages here.
            <br />
            <br />
            {convoFriendship ? (
              <>
                Send a message to begin a new conversation with{' '}
                <Box fontWeight='bold'>{convoDisplayName}.</Box>
              </>
            ) : (
              <>
                You are not colleagues with{' '}
                <Box fontWeight='bold'>{convoDisplayName}.</Box>
                <br />
                Send{' '}
                <Link
                  className='font-bold theme-secondary-lighter'
                  to={`/@${convoUsername}`}>
                  {convoDisplayName?.split(' ')[0]}
                </Link>{' '}
                a colleague request to start a conversation.
              </>
            )}
          </Box>
        ) : convoId ? (
          !window.navigator.onLine ? (
            <Box fontSize='1.2rem' textAlign='center'>
              <CloudOffIcon fontSize='large' />
              <br />
              <br />
              Can't load messages. You seem to be offline.
            </Box>
          ) : (
            <Box component='span' fontSize='3rem'>
              . . .
            </Box>
          )
        ) : (
          <Box fontSize='1.1rem' textAlign='center'>
            <ChatIcon fontSize='large' />
            <br />
            <br />
            Start a Conversation
          </Box>
        )}
      </Container>

      {convoId && (
        <Memoize
          memoizedComponent={MessageBox}
          convoId={convoId}
          messageHead={messageHead}
          webSocket={socket}
          setMessageHead={setMessageHead}
        />
      )}
    </>
  );
};

export default ChatMiddlePane;
