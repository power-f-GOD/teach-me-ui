import { displaySnackbar, fetchReplies } from '../actions';

import Axios from 'axios';

import { dispatch, getState } from '../utils';

import { apiBaseURL as baseURL, POST_REACTION, POST_REPLY } from '../constants';
import { PostStateProps, UserData } from '../types';

export const fetchMentionsFn = (value: string) => {
  const token = (getState().userData as UserData).token;
  return Axios({
    url: `/colleague/find?keyword=${value}`,
    method: 'GET',
    baseURL,
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      return response.data.data.colleagues;
    })
    .catch((e) => {
      dispatch(
        displaySnackbar({
          autoHide: true,
          open: true,
          message: e.message,
          severity: 'error'
        })
      );
    });
};

export const updatePostPage = (data: PostStateProps) => {
  switch (data.pipe) {
    case POST_REPLY:
      dispatch(fetchReplies({ data: [data] }, true));
      break;
    case POST_REACTION:
      console.log(data);
      break;
    default:
      break;
  }
  
}