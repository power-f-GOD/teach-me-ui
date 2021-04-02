import React from 'react';

import { APIConversationResponse, FetchState } from '../../../../types';
import Conversation from './Conversation';

const Conversations = (props: {
  conversations: FetchState<Partial<APIConversationResponse>[]>;
  userId: string;
  (index: number): Function;
}) => {
  const { conversations: _conversations, userId } = props;
  const convos = (_conversations.data ??
    []) as Partial<APIConversationResponse>[];

  return convos.map((conversation, i) => {
    const { last_message, unread_count, user_typing, colleague } = conversation;

    return (
      <Conversation
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
  });
};

export default React.memo(Conversations as any);
