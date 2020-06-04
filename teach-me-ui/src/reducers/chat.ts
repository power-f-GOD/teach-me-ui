import {
  SET_ACTIVE_CHAT,
  // REQUEST_START_CONVERSATION,
  // START_CONVERSATION,
  activeChatState,
  // activeChatMessagesState,
  SET_CHATS_MESSAGES,
  chatsMessagesState
} from '../constants/chat';
import { Chat, ReduxAction, ChatMessages } from '../constants/interfaces';

export const activeChat = (
  state: Chat = activeChatState,
  action: ReduxAction
): Chat => {
  if (action.type === SET_ACTIVE_CHAT) {
    return {
      ...state,
      avatar: '',
      ...action.payload
    };
  }

  return state;
};

export const chatsMessages = (
  state: ChatMessages = chatsMessagesState,
  action: ReduxAction
): ChatMessages => {
  if (action.type === SET_CHATS_MESSAGES) {
    return { 
      ...state,
      ...action.payload 
    };
  }

  return state;
};
