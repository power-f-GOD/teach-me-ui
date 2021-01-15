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
  MAKE_POST,
  PostContent,
  FetchState,
  NotificationSoundState,
  TONE_NAME__OPEN_ENDED,
  postState
} from '../../../constants';

import {
  getState,
  checkNetworkStatusWhilstPend,
  getCharacterSequenceFromText,
  logError,
  http,
  displayModal,
  promisedDispatch
} from '../../../functions';

import axios from 'axios';
import { pingUser } from '../../notifications';
import { posts } from './posts';
import { triggerNotificationSound } from '../..';

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

export const requestCreatePost = ({
  post,
  media
}: {
  post: PostContent;
  media: Array<string>;
}) => (dispatch: Function) => {
  const { userData, notificationSound } = getState() as {
    userData: UserData;
    notificationSound: NotificationSoundState;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;
  const mentions = getCharacterSequenceFromText(post.text, '@');

  dispatch(
    createPost({
      status: 'pending'
    })
  );
  checkNetworkStatusWhilstPend({
    name: 'createPost',
    func: createPost
  });

  http
    .post<PostStateProps>(
      '/post/make',
      {
        text: post.text,
        mentions,
        hashtags: getCharacterSequenceFromText(post.text, '#'),
        media
      },
      true
    )
    .then(({ data, error: err }) => {
      if (!err) {
        dispatch(
          posts({
            data: [{ ...postState, ...data, sender: userData }],
            statusText: 'new post created'
          })
        );
        displayModal(false);

        if (notificationSound.isPlaying) {
          promisedDispatch(
            triggerNotificationSound({ play: false, isPlaying: false })
          ).then(() => {
            dispatch(triggerNotificationSound({ play: true, toneName }));
          });
        } else {
          dispatch(triggerNotificationSound({ play: true, toneName }));
        }
      }

      dispatch(
        createPost({
          status: err ? 'settled' : 'fulfilled',
          err
        })
      );

      if (mentions.length && !err) {
        pingUser(mentions);
      }
    })
    .catch(logError(createPost));

  return {
    type: SUBMIT_POST
  };
};

export const createPost = (
  payload: FetchState<PostStateProps>
): ReduxAction => {
  return { type: MAKE_POST, payload };
};
