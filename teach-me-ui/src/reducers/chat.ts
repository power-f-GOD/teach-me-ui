import {
  SET_ACTIVE_CHAT,
  // REQUEST_START_CONVERSATION,
  // START_CONVERSATION,
  activeChatState,
  SET_CHATS_MESSAGES,
  chatsMessagesState,
  SET_PEOPLE_ENROLLED_IN_INSTITUTION
} from '../constants/chat';
import {
  Chat,
  ReduxAction,
  ChatData,
  SearchState
} from '../constants/interfaces';
import { statusPropsState } from '../constants';

export const peopleEnrolledInInstitution = (
  state: SearchState = { ...statusPropsState, data: [] },
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
