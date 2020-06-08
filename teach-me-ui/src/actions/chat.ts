import axios from 'axios';

import {
  ReduxAction,
  Chat,
  Message,
  ChatData,
  AnchorInfo,
  SearchState
} from '../constants/interfaces';
import {
  GET_PEOPLE_ENROLLED_IN_INSTITUTION,
  SET_PEOPLE_ENROLLED_IN_INSTITUTION,
  SET_ACTIVE_CHAT,
  REQUEST_START_CONVERSATION,
  START_CONVERSATION,
  SET_CHATS_MESSAGES
} from '../constants/chat';
import {
  logError,
  getState,
  callNetworkStatusCheckerFor
} from '../functions';
// import { displaySnackbar } from './misc';

const baseUrl = 'teach-me-services.herokuapp.com/api/v1';
const cookieEnabled = navigator.cookieEnabled;

export const peopleEnrolledInInstitution = (payload: SearchState): ReduxAction => {
  return {
    type: SET_PEOPLE_ENROLLED_IN_INSTITUTION,
    payload
  }
}

export const getPeopleEnrolledInInstitution = (params?: string) => (dispatch: Function): ReduxAction => {
  let token = '';

  dispatch(peopleEnrolledInInstitution({ status: 'pending' }));
  callNetworkStatusCheckerFor(peopleEnrolledInInstitution);

  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  }

  axios({
    url: `https://${baseUrl}/institution/people?limit=30`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then((response: any) => {
      
      console.log('people enrolled:', response.data);
      if (!response.data.error) {
        dispatch(peopleEnrolledInInstitution({ status: 'fulfilled', err: false, data: response.data.people }));
      }
      else {
      
        dispatch(peopleEnrolledInInstitution({ status: 'fulfilled', err: true, data: [] }));
      }
    }).catch(logError);

  return {
    type: GET_PEOPLE_ENROLLED_IN_INSTITUTION
  }
}

export const setActiveChat = (payload: Chat): ReduxAction => {
  return {
    type: SET_ACTIVE_CHAT,
    payload
  };
};

export const setChatsMessages = (payload: AnchorInfo) => {
  // payload message 'name' will be used as 'anchorId' temporarily
  let { name, avatar, id, messages } = payload;
  let activeChatData = getState().chatsMessages[id] ?? {};
  let chatData: ChatData = {
    [id]: { ...activeChatData, messages, name, avatar, id }
  };
  let chatMessages: Message[] = [];
  
  if (cookieEnabled) {
    let storageChatsMessages = localStorage.chatsMessages;

    if (storageChatsMessages) {
      storageChatsMessages = JSON.parse(storageChatsMessages);
      chatData[id] = { ...chatData[id], ...storageChatsMessages[id] };
      chatMessages = chatData[id]?.messages ?? [];
    } else {
      storageChatsMessages = {};
      localStorage.chatsMessages = JSON.stringify({});
    }

    if (payload.messages[0].text) {
      chatMessages.push(payload.messages[0]);
      storageChatsMessages[id] = {
        ...chatData[id],
        messages: chatMessages
      };
      localStorage.chatsMessages = JSON.stringify(storageChatsMessages);
    }
  } else {
    chatMessages = activeChatData?.messages?.slice() ?? [];

    if (payload.messages[0].text) chatMessages.push(payload.messages[0]);
  }
  
  return {
    type: SET_CHATS_MESSAGES,
    payload: {
      [id]: {
        ...chatData[id],
        messages: chatMessages
      }
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
