import {
  // StatusPropsState,
  Chat
} from './interfaces';

export const SET_ACTIVE_CHAT = 'SET_ACTIVE_CHAT';

export const REQUEST_START_CONVERSATION = 'START_CONVERSATION';
export const START_CONVERSATION = 'START_CONVERSATION';
export const REQUEST_SEND_MESSAGE = 'REQUEST_SEND_MESSAGE';
export const SEND_MESSAGE = 'SEND_MESSAGE';

export const CONVO_CHAT_TYPE = 'conversation';
export const ROOM_CHAT_TYPE = 'classroom';

// export const statusPropsState: StatusPropsState = {
//   status: 'settled',
//   err: false,
//   statusText: ' '
// };

export const activeChatState: Chat = {
  name: 'Start a conversation',
  avatar: '',
  type: ROOM_CHAT_TYPE,
  id: '',
  pathname: window.location.pathname,
  isOpen: false,
  isMinimized: false
};
