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
  REQUEST_NEW_CONVO,
  NEW_CONVO,
  SET_CHATS_MESSAGES
} from '../constants/chat';
import { logError, getState, callNetworkStatusCheckerFor } from '../functions';
// import { displaySnackbar } from './misc';

const baseUrl = 'teach-me-services.herokuapp.com/api/v1';
const cookieEnabled = navigator.cookieEnabled;

export const usersEnrolledInInstitution = (
  payload: SearchState
): ReduxAction => {
  return {
    type: SET_PEOPLE_ENROLLED_IN_INSTITUTION,
    payload
  };
};

export const getUsersEnrolledInInstitution = (params?: string) => (
  dispatch: Function
): ReduxAction => {
  let token = '';

  dispatch(usersEnrolledInInstitution({ status: 'pending' }));
  callNetworkStatusCheckerFor(usersEnrolledInInstitution);

  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  }

  axios({
    url: `https://${baseUrl}/institution/people?limit=10`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((response: any) => {
      if (!response.data.error) {
        dispatch(
          usersEnrolledInInstitution({
            status: 'fulfilled',
            err: false,
            data: response.data.people
          })
        );
      } else {
        dispatch(
          usersEnrolledInInstitution({
            status: 'fulfilled',
            err: true,
            data: []
          })
        );
      }
    })
    .catch(logError(usersEnrolledInInstitution));

  return {
    type: GET_PEOPLE_ENROLLED_IN_INSTITUTION
  };
};

export const newConversation = (payload: SearchState): ReduxAction => {
  return {
    type: NEW_CONVO,
    payload
  };
};

export const requestNewConversation = (conversationId?: string) => (
  dispatch: Function
): ReduxAction => {
  let token = '';

  dispatch(newConversation({ status: 'pending' }));
  // callNetworkStatusCheckerFor(newConversation);

  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  }

  axios({
    url: `https://${baseUrl}/conversation/new`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      participants: [conversationId]
    }
  })
    .then((response: any) => {
      console.log('new conversation:', response.data);

      if (!response.data.error) {
        dispatch(
          newConversation({
            status: 'fulfilled',
            err: false,
            id: response.data._id
          })
        );
      } else {
        dispatch(newConversation({ status: 'fulfilled', err: true, data: [] }));
      }
    })
    .catch(logError(newConversation));

  return {
    type: REQUEST_NEW_CONVO
  };
};

export const setActiveChat = (payload: Chat): ReduxAction => {
  return {
    type: SET_ACTIVE_CHAT,
    payload
  };
};

export const setChatsMessages = (payload: AnchorInfo) => {
  let { displayName, avatar, id, messages, info }: AnchorInfo = payload;
  let activeChatData = getState().chatsMessages[id] ?? {};
  let chatData: ChatData = {
    [id]: { ...activeChatData, messages, displayName, avatar, id, info }
  };
  let chatMessages: Message[] = [];

  if (cookieEnabled) {
    let storageChatsMessages = localStorage.chatsMessages;

    if (storageChatsMessages) {
      storageChatsMessages = JSON.parse(storageChatsMessages);
      chatData[id] = { ...chatData[id], ...storageChatsMessages[id] };
      chatMessages = storageChatsMessages[id]?.messages ?? [];
    } else {
      storageChatsMessages = {};
      localStorage.chatsMessages = JSON.stringify({});
    }

    if (payload.messages![0].text) {
      chatMessages.push(payload.messages![0]);
      storageChatsMessages[id] = {
        ...chatData[id],
        messages: chatMessages
      };
      localStorage.chatsMessages = JSON.stringify(storageChatsMessages);
    }
  } else {
    chatMessages = activeChatData?.messages?.slice() ?? [];

    if (payload.messages![0].text) chatMessages.push(payload.messages![0]);
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
