import axios from 'axios';

import { ReduxAction, Chat } from '../constants/interfaces';
import {
  SET_ACTIVE_CHAT,
  REQUEST_START_CONVERSATION,
  START_CONVERSATION
} from '../constants/chat';
// import { logError, getState, callNetworkStatusCheckerFor } from '../functions';
// import { displaySnackbar } from './misc';

const baseUrl = 'teach-me-services.herokuapp.com/api/v1';

export const setActiveChat = (payload: Chat) => {
  return {
    type: SET_ACTIVE_CHAT,
    payload
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
