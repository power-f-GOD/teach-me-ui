import {
  MAKE_REPOST,
  SUBMIT_POST,
  FETCH_POST,
  FETCH_REPLIES,
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
  ReduxActionV2
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

import { pingUser } from '../../notifications';
import { posts } from './posts';
import { triggerNotificationSound } from '../..';

export * from './posts';
export * from './recommendations';
export * from './trends';

export const makeRepost = (payload: FetchState<Object, string>) => {
  return {
    type: MAKE_REPOST,
    payload
  };
};

export const makeRepostRequest = (payload: SendReplyProps) => (dispatch: Function) => {
  dispatch(makeRepost({status: 'pending'}))

  checkNetworkStatusWhilstPend({
    name: 'makeRepost',
    func: makeRepost
  });

  const socket = getState().webSocket as WebSocket;
  // console.log(payload);

  socket.send(JSON.stringify(payload));
};

export const fetchReplies = (payload: FetchState<Array<Object>, string>) => {
  return {
    type: FETCH_REPLIES,
    payload
  };
};

export const fetchRepliesRequest = (postId?: string) => (dispatch: Function) => {
  dispatch(fetchReplies({status: 'pending', data:[]}));

  checkNetworkStatusWhilstPend({
    name: 'fetchReplies',
    func: fetchReplies
  });

  http
    .get(`/post/${postId}/replies?limit=10&skip=0`, true)
    .then((res) => {
      const { error, data } = res as {
        error: boolean;
        data: any;
      };
      if (!error) {
        dispatch(
          fetchReplies({
            status: 'fulfilled',
            err: false,
            data: data
          })
        );
      } else {
        dispatch(
          fetchReplies({
            status: 'fulfilled',
            err: true
          })
        );
      }
    })
    .catch(logError(fetchReplies));
};

export const fetchPost = (payload: FetchState<Object, string>) => {
  return {
    type: FETCH_POST,
    payload
  };
};

export const fetchPostRequest = (postId?: string) => ( dispatch: Function) => {
  dispatch(fetchPost({status: 'pending', data: postState}));

  checkNetworkStatusWhilstPend({
    name: 'fetchPost',
    func: fetchPost
  });

  http
    .get(`/post/${postId}`, true)
    .then((res) => {
      const { error, data } = res as {
        error: boolean;
        data: any;
      };
      if (!error) {
        dispatch(
          fetchPost({
            status: 'fulfilled',
            err: false,
            data: data
          })
        );
      } else {
        dispatch(
          fetchPost({
            status: 'fulfilled',
            err: true
          })
        );
      }
    })
    .catch(logError(fetchPost));
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
): ReduxActionV2<any> => {
  return { type: MAKE_POST, payload };
};
