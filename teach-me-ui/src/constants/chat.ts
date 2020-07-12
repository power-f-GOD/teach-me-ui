import {
  // StatusPropsState,
  ChatState,
  ChatData
} from './interfaces';

export const SET_CHAT_STATE = 'SET_CHAT_STATE';

export const REQUEST_START_CONVERSATION = 'START_CONVERSATION';
export const START_CONVERSATION = 'START_CONVERSATION';
export const REQUEST_SEND_MESSAGE = 'REQUEST_SEND_MESSAGE';
export const SEND_MESSAGE = 'SEND_MESSAGE';

export const ONE_TO_ONE = 'ONE_TO_ONE';
export const ONE_TO_MANY = 'ONE_TO_MANY';

export const GET_CONVERSATION_MESSAGES = 'GET_CHAT_MESSAGES';
export const SET_CONVERSATION_MESSAGES = 'SET_CHATS_MESSAGES';
export const GET_CONVERSATION_INFO = 'GET_CONVERSATION_INFO';
export const SET_CONVERSATION_INFO = 'SET_CONVERSATION_INFO';
export const SET_CONVERSATION = 'SET_CONVERSATION';
// export const SET_CONVERSATION_MESSAGES = 'SET_CONVERSATION_MESSAGES';

export const GET_PEOPLE_ENROLLED_IN_INSTITUTION =
  'GET_PEOPLE_ENROLLED_IN_INSTITUTION';
export const SET_PEOPLE_ENROLLED_IN_INSTITUTION =
  'SET_PEOPLE_ENROLLED_IN_INSTITUTION';

export const GET_CONVERSATIONS = 'GET_CONVERSATIONS';
export const SET_CONVERSATIONS = 'SET_CONVERSATIONS';

export const chatStateProps: ChatState = {
  queryString: window.location.pathname,
  isOpen: false,
  isMinimized: false
};

export const chatsMessagesState: ChatData = {
  id: {
    displayName: '',
    id: '',
    messages: [],
    avatar: '',
    type: 'conversation',
    info: {
      username: '',
      institution: '',
      department: '',
      level: ''
    }
  }
};
