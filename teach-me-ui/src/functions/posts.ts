import {
  sendReactionToServer,
  sendReplyToServer,
  fetchPosts,
  displaySnackbar
} from '../actions';

import Axios from 'axios';

import { dispatch, getState } from './utils';

import { Post, apiBaseURL as baseURL, UserData } from '../constants';

export const replyToPostFn = async (id: string, reply: Post) => {
  await dispatch(
    sendReplyToServer({
      ...reply,
      pipe: 'POST_REPLY',
      post_id: id
    })
  );
};

export const reactToPostFn = (
  id: string,
  type: 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL'
) => {
  dispatch(
    sendReactionToServer({
      post_id: id,
      reaction: type as 'UPVOTE' | 'DOWNVOTE',
      pipe: 'POST_REACTION'
    })
  );
};

export const fetchPostsFn = (
  type: 'FEED' | 'WALL',
  userId?: string,
  update = false
) => {
  dispatch(fetchPosts(type, userId, update));
};

export const fetchMentionsFn = (value: string) => {
  const token = (getState().userData as UserData).token;
  return Axios({
    url: `/colleagues/find?keyword=${value}`,
    method: 'GET',
    baseURL,
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      return response.data.colleagues;
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
