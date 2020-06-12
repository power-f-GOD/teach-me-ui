import {
  // StatusPropsState,
  Chat,
  ChatData
} from './interfaces';

export const SET_ACTIVE_CHAT = 'SET_ACTIVE_CHAT';

export const REQUEST_START_CONVERSATION = 'START_CONVERSATION';
export const START_CONVERSATION = 'START_CONVERSATION';
export const REQUEST_SEND_MESSAGE = 'REQUEST_SEND_MESSAGE';
export const SEND_MESSAGE = 'SEND_MESSAGE';

export const CONVO_CHAT_TYPE = 'conversation';
export const ROOM_CHAT_TYPE = 'classroom';
export const SET_CHATS_MESSAGES = 'SET_ACTIVE_CHAT_MESSAGES';

export const GET_PEOPLE_ENROLLED_IN_INSTITUTION =
  'GET_PEOPLE_ENROLLED_IN_INSTITUTION';
export const SET_PEOPLE_ENROLLED_IN_INSTITUTION =
  'SET_PEOPLE_ENROLLED_IN_INSTITUTION';

export const REQUEST_NEW_CONVO = '';
export const NEW_CONVO = '';

export const activeChatState: Chat = {
  anchor: {
    displayName: 'Start a conversation',
    avatar: '',
    type: CONVO_CHAT_TYPE,
    id: '',
    info: {
      username: '',
      institution: '',
      department: '',
      level: ''
    }
  },
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
