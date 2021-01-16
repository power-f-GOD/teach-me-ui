import { dispatch, getState, promisedDispatch } from '../functions';

import {
  makeRepostResolved,
  makeRepostRejected,
  createPost,
  posts,
  triggerNotificationSound
} from '../actions';

import { displayModal } from '../functions';

import { POST_REACTION, POST_REPLY, TONE_NAME__OPEN_ENDED } from '../constants';
import { SocketPipe, NotificationSoundState } from '../types';

export default function post(data: any) {
  const { notificationSound } = getState() as {
    notificationSound: NotificationSoundState;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;

  try {
    // console.log('posts pipe:', data);
    switch (data.pipe as SocketPipe) {
      case POST_REACTION:
      case POST_REPLY:
        // console.log(data);
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
            makeRepostResolved({
              error: false,
              message: 'Repost was made successfully'
            })
          );
          window.history.back();
          dispatch(displayModal(false));
        } else {
          dispatch(makeRepostRejected({ error: true, message: data.message }));
        }
        break;
      // if (!data.error) {
      //   dispatch(
      //     replyToPost({
      //       status: 'fulfilled',
      //       err: false,
      //       data
      //     })
      //   );
      // } else {
      //   dispatch(
      //     replyToPost({
      //       status: 'fulfilled',
      //       err: true,
      //       data
      //     })
      //   );
      // }
      default:
        break;
    }
  } catch (e) {}
}
