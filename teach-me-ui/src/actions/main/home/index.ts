import {
  MAKE_REPOST,
  SUBMIT_POST,
  apiBaseURL as baseURL,
  MAKE_POST,
  TONE_NAME__OPEN_ENDED,
  postState
} from '../../../constants';
import {
  PostContent,
  FetchState,
  NotificationSoundState,
  UserData,
  SendReplyProps,
  PostStateProps,
  ReduxAction,
  StatusPropsState
} from '../../../types';

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

export const makeRepost = (payload: StatusPropsState) => {
  return {
    type: MAKE_REPOST,
    payload
  };
};

export const makeRepostRequest = (payload: SendReplyProps) => (dispatch: Function) => {
  dispatch(makeRepost({status: 'pending'}))
  const socket = getState().webSocket as WebSocket;
  console.log(payload);

  socket.send(JSON.stringify(payload));
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
      console.log(data);
      
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
