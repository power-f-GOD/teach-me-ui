import {
  SET_ACTIVE_CHAT,
  // REQUEST_START_CONVERSATION,
  // START_CONVERSATION,
  activeChatState,
  SET_CHATS_MESSAGES,
  chatsMessagesState
} from '../constants/chat';
import { Chat, ReduxAction, ChatData } from '../constants/interfaces';

export const activeChat = (
  state: Chat = activeChatState,
  action: ReduxAction
): Chat => {
  if (action.type === SET_ACTIVE_CHAT) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const chatsMessages = (
  state: ChatData = chatsMessagesState,
  action: ReduxAction
): ChatData => {
  if (action.type === SET_CHATS_MESSAGES) {
    return { 
      ...state,
      ...action.payload 
    };
  }

  return state;
};
