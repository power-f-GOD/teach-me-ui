import { dispatch, getState, promisedDispatch } from '../functions';

import {
  createPost,
  posts,
  triggerNotificationSound,
  makeRepost
} from '../actions';

import { displayModal } from '../functions';

import {
  postState,
  POST_REACTION,
  POST_REPLY,
  TONE_NAME__OPEN_ENDED
} from '../constants';
import { SocketPipe, NotificationSoundState } from '../types';

export default function post(data: any) {
  const { notificationSound, userData } = getState() as {
    notificationSound: NotificationSoundState;
    userData: any;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;

  try {
    switch (data.pipe as SocketPipe) {
      case POST_REACTION:
      case POST_REPLY:
        dispatch(posts({ data: [{ ...data }] }));

        if (data.pipe === POST_REPLY) {
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
        break;
      case 'POST_REPOST':
        if (!data.error) {
          // if (data.count !== undefined) {
          //   dispatch(updateRepostData(data as RepostResult));
          // }
          if (data.action_count !== undefined) dispatch(createPost(data));
          document.querySelector('.middle-pane-col')?.scrollTo(0, 0);
          dispatch(
            makeRepost({
              err: false,
              status: 'fulfilled'
            })
          );
          // console.log(data);

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

          window.history.back();
          dispatch(displayModal(false));
        } else {
          dispatch(
            makeRepost({
              err: true,
              status: 'settled',
              statusText: data.message
            })
          );
        }
        break;
      default:
        break;
    }
  } catch (e) {}
}
