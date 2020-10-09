// import produce from 'immer';

import {
  SET_CHAT_STATE,
  // REQUEST_START_CONVERSATION,
  // START_CONVERSATION,
  chatStateProps,
  SET_PEOPLE_ENROLLED_IN_INSTITUTION,
  SET_CONVERSATIONS,
  SET_CONVERSATION_MESSAGES,
  SET_CONVERSATION_INFO,
  SET_CONVERSATION,
  SET_CONVERSATIONS_MESSAGES
} from '../constants/chat';
import {
  ChatState,
  ReduxAction,
  SearchState,
  ConversationsMessages,
  ConversationInfo,
  APIConversationResponse,
  UserData
} from '../constants/interfaces';
import { statusPropsState, searchState } from '../constants';

export const usersEnrolledInInstitution = (
  state: SearchState = { ...searchState },
  action: ReduxAction
) => {
  if (action.type === SET_PEOPLE_ENROLLED_IN_INSTITUTION) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

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
  state = {} as ConversationsMessages,
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

export const conversationInfo = (
  state: ConversationInfo = {
    ...statusPropsState,
    online_status: 'OFFLINE',
    data: {}
  },
  action: ReduxAction
): ConversationInfo => {
  if (action.type === SET_CONVERSATION_INFO) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const conversation = (
  state: Partial<APIConversationResponse & Omit<UserData, 'token'>> = {},
  action: ReduxAction
): Partial<APIConversationResponse & Omit<UserData, 'token'>> => {
  if (action.type === SET_CONVERSATION) {
    return {
      ...(Object.keys(action.payload).length ? state : {}),
      friendship: action.payload.friendship,
      ...action.payload
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
