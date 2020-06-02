import {
  SET_ACTIVE_CHAT,
  // REQUEST_START_CONVERSATION,
  // START_CONVERSATION,
  activeChatState
} from '../constants/chat';
import { Chat, ReduxAction } from '../constants/interfaces';

export const activeChat = (
  state: Chat = activeChatState,
  action: ReduxAction
) => {
  if (action.type === SET_ACTIVE_CHAT) {
    return {
      ...state,
      avatar: '',
      ...action.payload
    };
  }

  return state;
};
