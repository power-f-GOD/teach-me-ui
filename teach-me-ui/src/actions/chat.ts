import axios from 'axios';

import { ReduxAction, Chat, Message } from '../constants/interfaces';
import {
  SET_ACTIVE_CHAT,
  REQUEST_START_CONVERSATION,
  START_CONVERSATION,
  SET_CHATS_MESSAGES
} from '../constants/chat';
import {
  // logError,
  getState
  // callNetworkStatusCheckerFor
} from '../functions';
// import { displaySnackbar } from './misc';

const baseUrl = 'teach-me-services.herokuapp.com/api/v1';
const cookieEnabled = navigator.cookieEnabled;

export const setActiveChat = (payload: Chat): ReduxAction => {
  return {
    type: SET_ACTIVE_CHAT,
    payload
  };
};

export const setChatsMessages = (payload: Message) => {
  // message 'name' will be used as 'anchorId' temporarily
  let id = payload.anchorId as string;
  let activeChatMessages = getState().chatsMessages[id];
  let messages: Message[] = [];

  if (cookieEnabled) {
    let storageChatsMessages = localStorage.chatsMessages;

    if (storageChatsMessages) {
      storageChatsMessages = JSON.parse(storageChatsMessages);
      messages = storageChatsMessages[id] ?? [];
    } else {
      storageChatsMessages = {};
      localStorage.chatsMessages = JSON.stringify({});
    }

    if (payload.text) {
      messages.push(payload);
      storageChatsMessages[id] = messages;
      localStorage.chatsMessages = JSON.stringify(storageChatsMessages);
    }
    
  } else {
    messages = activeChatMessages?.slice() ?? [];

    if (payload.text)
      messages.push(payload);
  }

  return {
    type: SET_CHATS_MESSAGES,
    payload: {
      [id]: messages
    }
  };
};

export const requestStartConversation = (data: any) => (
  dispatch: Function
): ReduxAction => {
  // clearTimeout(institutionSearchTimeout);
  // dispatch(matchingInstitutions({ status: 'pending' }));
  // callNetworkStatusCheckerFor(matchingInstitutions);

  axios({
    url: `https:${baseUrl}/conversation/new`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ''
    },
    data: {}
  });

  return {
    type: REQUEST_START_CONVERSATION
  };
};

export const startConversation = () => {
  return {
    type: START_CONVERSATION
  };
};
