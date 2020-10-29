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
      if (user_id === id && _conversation._id) {
        dispatch(
          conversation(_conversation._id, {
            online_status,
            last_seen: last_seen ? last_seen : _conversation.last_seen
          })
        );
      }

      if (userData.id !== user_id) {
        dispatch(conversations({ data: [{ ...message }] }));
      }

      break;
  }
}
