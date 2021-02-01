import React, { useCallback } from 'react';
import { NavLink, match as Match } from 'react-router-dom';

import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import BlockIcon from '@material-ui/icons/Block';

import {
  chatState,
  conversationMessages,
  conversationsMessages
} from '../../../../actions/main/chat';
import { dispatch, delay } from '../../../../utils';
import {
  ChatState,
  APIConversationResponse,
  SearchState,
  APIMessageResponse,
  ConversationMessages
} from '../../../../types';
import {
  getConversationMessages,
  conversation,
  conversations
} from '../../../../actions/main/chat';
import { ChatTimestamp, ChatStatus } from '../crumbs';
import { getState } from '../../../../appStore';
import { scrollViewRef } from '../MiddlePane/ScrollView';
import { Memoize } from '..';

export const ConversationsList = (props: {
  conversations: SearchState;
  userId: string;
  (index: number): Function;
}) => {
  const { conversations: _conversations, userId } = props;
  const convos = (_conversations.data ??
    []) as Partial<APIConversationResponse>[];

  return (
    <>
      {convos.map((conversation, i) => {
        const {
          last_message,
          unread_count,
          user_typing,
          colleague
        } = conversation;

        return (
          <Memoize
            memoizedComponent={Conversation}
            conversation={conversation}
            forceUpdate={
              '' +
              last_message?.id +
              last_message?.delivered_to +
              last_message?.seen_by +
              last_message?.deleted +
              unread_count +
              user_typing +
              colleague?.online_status
            }
            index={i}
            userId={userId}
            key={i}
          />
        );
      })}
    </>
  );
};

function Conversation({
  conversation: _conversation,
  userId,
  index
}: {
  conversation: Partial<APIConversationResponse>;
  userId: string;
  index: number;
  forceUpdate: string;
}) {
  const {
    conversation_name: displayName,
    id: convoId,
    last_message,
    friendship,
    participants,
    user_typing,
    unread_count,
    created_at,
    last_activity,
    colleague
  } = _conversation ?? {};
  const { id: _userId, online_status, profile_photo } = colleague || {};
  const isRecent: boolean = { ...(last_message as any) }.is_recent;

  const [recent, setRecent] = React.useState<number>(0);

  if (isRecent) setRecent(index);

  delete (last_message as any)?.is_recent;

  const lastMessageTimestamp =
    last_message?.date ?? last_activity ?? Date.now();
  const lastMessageDate = new Date(Number(lastMessageTimestamp)).toDateString();
  const lastMessageDateString = new Date(lastMessageTimestamp)
    .toLocaleString()
    .split(',')[0];
  const todaysDate = new Date().toDateString();
  const todaysDateString = new Date().toLocaleString().split(',')[0];
  const lastMessageSentYesterday =
    Math.abs(
      ((new Date(todaysDate) as any) -
        (new Date(lastMessageDate) as any)) as any
    ) /
      864e5 ===
    1;

  const _chatState: ChatState = {
    pathname: `/chat/${convoId}`,
    queryParam: '?1'
  };

  const navLinkActive = useCallback(
    (match: Match<{ convoId: string }> | null) => {
      return Boolean(convoId && match?.url === _chatState.pathname);
    },
    [convoId, _chatState.pathname]
  );

  const handleChatClick = useCallback(
    (chatInfo: ChatState, extra: { convoId: string; userId: string }) => {
      return (e: any) => {
        const { pathname } = window.location;
        const cid = pathname.split('/').slice(-1)[0];
        const { convoId } = extra;
        const {
          conversation: _conversation,
          conversationMessages: _conversationMessages
        } = getState() as {
          //using getState here to prevent rerenders that would be caused if props is used
          conversation: APIConversationResponse;
          conversationMessages: ConversationMessages;
        };
        const { id: prevChatConvoId } = _conversation;
        const prevChatConvoMessages = _conversationMessages.data;

        if (window.innerWidth < 992) {
          const scrollView = scrollViewRef.current;

          if (scrollView) {
            scrollView.scrollTop = scrollView.scrollHeight;
          }
        }

        if (cid === convoId || prevChatConvoId === convoId) {
          dispatch(chatState({ ...chatInfo }, true));
          e.preventDefault();
          return;
        }

        //update store for previous chat before updating/populating current chat
        if (prevChatConvoId && prevChatConvoMessages?.length) {
          dispatch(
            conversationsMessages({
              convoId: prevChatConvoId,
              statusText: 'replace messages',
              data: { [prevChatConvoId]: [...prevChatConvoMessages] }
            })
          );
        }

        dispatch(
          getConversationMessages(convoId, 'pending', 'loading new')(dispatch)
        );

        if (window.navigator.onLine) {
          // dispatch(getConversationInfo(userId)(dispatch));

          //delay so that state conversation unread_count is not updated immediately when the conversation opens
          delay(1250).then(() => {
            dispatch(
              conversations({ data: [{ unread_count: 0, id: convoId }] })
            );
          });
        } else {
          dispatch(conversationMessages({ status: 'pending', err: true }));
        }

        // dispatch(chatState(chatInfo));
        dispatch(conversation(convoId));
      };
    },
    []
  );

  return (
    <NavLink
      to={`/chat/${convoId}?1`}
      className={`chat-tab-panel-item ${!friendship ? 'uncolleagued' : ''} ${
        recent === index ? 'recent' : ''
      }`}
      key={convoId}
      isActive={navLinkActive as any}
      onClick={handleChatClick(
        { ..._chatState },
        { convoId: String(convoId), userId: String(_userId) }
      )}>
      <Col className='chat-conversation-name-wrapper'>
        <Badge
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          className={online_status?.toLowerCase() ?? 'offline'}
          overlap='circle'
          variant='dot'>
          <Avatar
            component='span'
            className={'chat-avatar mr-2'}
            alt={displayName}
            src={profile_photo || ''}
          />
        </Badge>{' '}
        <Box width='100%' maxWidth='calc(100% - 3.65rem)'>
          <Box className='display-name-wrapper'>
            <Box className='display-name'>{displayName}</Box>

            <ChatTimestamp
              className={`${
                _conversation.unread_count ? 'theme-secondary-lightest' : ''
              }`}
              timestamp={
                lastMessageSentYesterday
                  ? 'Yesterday'
                  : todaysDateString !== lastMessageDateString
                  ? lastMessageDateString
                  : last_message?.date ?? created_at ?? 0
              }
            />
          </Box>
          {friendship && (
            <Box
              className='chat-message-badge-wrapper d-flex justify-content-between'
              maxWidth='100%'
              width='100%'>
              <Box
                className={`chat-last-message mt-1 ${
                  last_message?.deleted ? 'font-italic' : ''
                }`}
                maxWidth={unread_count ? 'calc(100% - 2.25rem)' : '100%'}
                title={last_message?.message ?? ''}>
                {!last_message ? (
                  <Box className='chat-new-conversation-tag'>NEW</Box>
                ) : (
                  <>
                    <Box
                      position='absolute'
                      className={`theme-secondary-lightest font-normal ${
                        user_typing ? 'show font-bold' : 'hide'
                      }`}>
                      typing...
                    </Box>
                    <Box
                      className={`${user_typing ? 'hide' : 'show'} ${
                        unread_count ? 'font-bold' : ''
                      } pr-1`}>
                      <ChatStatus
                        type={
                          last_message?.sender_id === userId
                            ? 'outgoing'
                            : 'incoming'
                        }
                        isRecent={!!last_message.pipe}
                        forceUpdate={
                          last_message?.delivered_to!?.length +
                          last_message?.seen_by!?.length
                        }
                        participants={participants as string[]}
                        message={last_message as APIMessageResponse}
                        userId={userId as string}
                      />{' '}
                      {last_message?.deleted ? (
                        last_message?.sender_id === userId ? (
                          <>
                            <BlockIcon fontSize='inherit' /> You deleted this
                            message
                          </>
                        ) : (
                          <>
                            <BlockIcon fontSize='inherit' /> You can't see this
                            message
                          </>
                        )
                      ) : (
                        last_message?.message
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Badge
                className={unread_count ? 'show-badge' : ''}
                badgeContent={unread_count}
                max={9999}
              />
            </Box>
          )}
        </Box>
      </Col>
    </NavLink>
  );
}
