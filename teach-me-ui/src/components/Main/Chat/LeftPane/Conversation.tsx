import React, { useCallback } from 'react';
import { NavLink, match as Match, useHistory } from 'react-router-dom';

import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import BlockIcon from '@material-ui/icons/Block';

import {
  ChatState,
  APIConversationResponse,
  APIMessageResponse
} from '../../../../types';
import { ChatTimestamp, ChatStatus } from '../crumbs';
import { getNecessaryConversationData } from '../../../../functions';
import { KAvatar } from '../../../shared';

const Conversation = ({
  conversation: _conversation,
  userId,
  index
}: {
  conversation: Partial<APIConversationResponse>;
  userId: string;
  index: number;
  forceUpdate: string;
}) => {
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
  const history = useHistory();

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
    (extra: { convoId: string; userId: string }) => (e: any) => {
      //attempt to fix popstate issue(s)
      if (window.location.search.slice(1) === '1') {
        e.preventDefault();
        history.replace(`/chat/${convoId}?1`);
      }

      getNecessaryConversationData({ extra, e, history });
    },
    [history, convoId]
  );

  return (
    <NavLink
      to={`/chat/${convoId}?1`}
      className={`chat-tab-panel-item ${!friendship ? 'uncolleagued' : ''} ${
        recent === index ? 'recent' : ''
      }`}
      key={convoId}
      isActive={navLinkActive as any}
      onClick={handleChatClick({
        convoId: String(convoId),
        userId: String(_userId)
      })}>
      <Col className='chat-conversation-name-wrapper'>
        <Badge
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          className={online_status?.toLowerCase() ?? 'offline'}
          overlap='circle'
          variant='dot'>
          <KAvatar
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
};

export default React.memo(Conversation);
