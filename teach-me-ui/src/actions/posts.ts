import {
  ReduxAction,
  CREATE_POST,
  REACT_TO_POST,
  FETCH_POST_REJECTED,
  FETCH_POST_RESOLVED,
  FETCH_POST_STARTED,
  FETCHED_POSTS,
  PostPropsState,
  ReactPostState,
  FetchPostsState,
  apiBaseURL as baseURL,
  UserData
} from '../constants';

import { getState } from '../functions';

import Axios from 'axios';

export const createPost = (payload: PostPropsState): ReduxAction => {
  return { type: CREATE_POST, payload };
};

export const reactToPost = (payload: ReactPostState): ReduxAction => {
  return { type: REACT_TO_POST, payload };
};

export const fetchPosts: Function = () => (dispatch: Function) => {
  dispatch(fetchPostsStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/feed`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.posts;
    })
    .then((state) => {
      dispatch(fetchedPosts(state as Array<PostPropsState>));
      dispatch(
        fetchPostsResolved({ error: false, message: 'Fetch posts successful' })
      );
    })
    .catch((err) => {
      dispatch(fetchPostsRejected({ error: true, message: err.message }));
    });
};

const fetchedPosts = (payload: Array<PostPropsState>): ReduxAction => {
  return {
    type: FETCHED_POSTS,
    payload
  };
};

const fetchPostsStarted = (payload?: Partial<FetchPostsState>): ReduxAction => {
  return {
    type: FETCH_POST_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
const fetchPostsResolved = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: FETCH_POST_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
const fetchPostsRejected = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: FETCH_POST_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};
