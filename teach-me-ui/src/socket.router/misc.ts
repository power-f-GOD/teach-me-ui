import queryString from 'query-string';

import { ONLINE_STATUS } from '../constants/misc';
import { dispatch, getState } from '../functions/utils';
import { conversations, conversation } from '../actions/chat';
import { ChatState, APIConversationResponse, UserData } from '../constants';

export default function misc(message: any) {
  const { chatState, conversation: _conversation, userData } = getState() as {
    chatState: ChatState;
    conversation: APIConversationResponse;
    userData: UserData;
  };
  const { id } = queryString.parse(chatState.queryString) ?? {};
  const { pipe, user_id, online_status, last_seen } = message;

  switch (pipe) {
    case ONLINE_STATUS:
      const convoData = {
        ...message,
        colleague: {
          online_status,
          last_seen
        }
      } as APIConversationResponse;

      if (!last_seen) {
        delete convoData.colleague.last_seen;
      }

      if (user_id === id && _conversation.id) {
        dispatch(conversation(_conversation.id, { ...convoData }));
      }

      if (userData.id !== user_id) {
        dispatch(conversations({ data: [{ ...convoData }] }));
      }

      break;
  }
}
