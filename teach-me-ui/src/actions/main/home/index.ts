import {
  ReduxAction,
  MAKE_REPOST_REJECTED,
  MAKE_REPOST_RESOLVED,
  MAKE_REPOST_STARTED,
  SUBMIT_POST,
  PostStateProps,
  FetchPostsState,
  MakeRepostState,
  apiBaseURL as baseURL,
  UserData,
  SendReplyProps,
  CREATE_POST,
  PostContent,
  FetchState
} from '../../../constants';

import {
  getState,
  checkNetworkStatusWhilstPend,
  getCharacterSequenceFromText,
  logError
} from '../../../functions';

import axios from 'axios';
import { pingUser } from '../../notifications';

export * from './posts';
export * from './recommendations';
export * from './trends';

export const makeRepost = (payload: SendReplyProps) => (dispatch: Function) => {
  dispatch(makeRepostStarted());

  const socket = getState().webSocket as WebSocket;
  console.log(payload);

  socket.send(JSON.stringify(payload));
};

export const makeRepostStarted = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};

export const makeRepostResolved = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};

export const makeRepostRejected = (
  payload?: Partial<MakeRepostState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchReplies = (postId?: string) => (dispatch: Function) => {
  const userData = getState().userData as UserData;
  const headers =
    userData && userData.token
      ? { Authorization: `Bearer ${userData.token}` }
      : {};
  axios({
    url: `/post/${postId}/replies?limit=10&skip=0`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data.replies;
    })
    .then((state) => {})
    .catch((err) => {});
};

export const fetchPost: Function = (postId?: string) => (
  dispatch: Function
) => {
  const userData = getState().userData as UserData;
  const headers =
    userData && userData.token
      ? { Authorization: `Bearer ${userData.token}` }
      : {};

  axios({
    url: `/post/${postId}`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {})
    .catch((err) => {});
};

export const createPost = (
  payload: FetchState<PostStateProps>
): ReduxAction => {
  return { type: CREATE_POST, payload };
};

export const requestCreatePost = ({
  post,
  media
}: {
  post: PostContent;
  media: Array<string>;
}) => (dispatch: Function) => {
  dispatch(
    createPost({
      status: 'pending'
    })
  );
  const token = (getState().userData as UserData).token;
  const addPost = (payload: any) => {
    window.scrollTo(0, 0);
    dispatch(createPost(payload));
  };

  checkNetworkStatusWhilstPend({
    name: 'makePost',
    func: createPost
  });

  axios({
    url: `post/make`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Content_Type: 'application/json'
    },
    data: {
      text: post.text,
      mentions: getCharacterSequenceFromText(post.text, '@'),
      hashtags: getCharacterSequenceFromText(post.text, '#'),
      media
    }
  })
    .then(({ data }) => {
      addPost(data.data);
      dispatch(
        createPost({
          status: 'fulfilled'
        })
      );
      getCharacterSequenceFromText(post.text, '@') &&
        pingUser(getCharacterSequenceFromText(post.text, '@'));
    })
    .catch(logError(createPost));
  return {
    type: SUBMIT_POST
  };
};
