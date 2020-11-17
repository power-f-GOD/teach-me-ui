// import produce from 'immer';

import {
  SET_CHAT_STATE,
  chatStateProps,
  SET_CONVERSATIONS,
  SET_CONVERSATION_MESSAGES,
  SET_CONVERSATION,
  SET_CONVERSATIONS_MESSAGES
} from '../constants/chat';
import {
  ChatState,
  ReduxAction,
  SearchState,
  ConversationsMessages,
  APIConversationResponse,
  ReduxActionV2
} from '../constants/interfaces';
import { searchState } from '../constants';

export const conversations = (
  state: SearchState = { ...searchState },
  action: ReduxAction
) => {
  if (action.type === SET_CONVERSATIONS) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const conversationsMessages = (
  state = { ...searchState } as ConversationsMessages,
  action: ReduxAction
): ConversationsMessages => {
  if (action.type === SET_CONVERSATIONS_MESSAGES) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const conversation = (
  state = {} as Partial<APIConversationResponse>,
  action: ReduxActionV2<Partial<APIConversationResponse>>
): Partial<APIConversationResponse> => {
  if (action.type === SET_CONVERSATION) {
    return {
      ...(Object.keys(action.payload!).length ? state : {}),
      friendship: action.payload?.friendship,
      ...action.payload,
      colleague: {
        ...(state.colleague ?? {}),
        ...(action.payload?.colleague! ?? {})
      }
    };
  }

  return state;
};

export const conversationMessages = (
  state: SearchState = { ...searchState },
  action: ReduxAction
): SearchState => {
  if (action.type === SET_CONVERSATION_MESSAGES) {
    return { ...state, ...action.payload };
  }

  return state;
};

export const chatState = (
  state: ChatState = chatStateProps,
  action: ReduxAction
): ChatState => {
  if (action.type === SET_CHAT_STATE) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};
