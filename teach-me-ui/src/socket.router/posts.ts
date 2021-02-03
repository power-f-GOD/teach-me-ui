import { dispatch, getState, promisedDispatch, inProfile } from '../functions';

import {
  createPost,
  posts,
  triggerNotificationSound,
  makeRepost,
  profilePosts
} from '../actions';

import { displayModal } from '../functions';

import {
  postState,
  POST_REACTION,
  POST_REPLY,
  TONE_NAME__OPEN_ENDED
} from '../constants';
import { SocketPipe, NotificationSoundState } from '../types';

export default function post(_data: any) {
  const { notificationSound, userData } = getState() as {
    notificationSound: NotificationSoundState;
    userData: any;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;

  // console.log('data from server:', data);
  try {
    switch (_data.pipe as SocketPipe) {
      case POST_REACTION:
      case POST_REPLY: {
        const data = [{ ..._data }];

        dispatch(inProfile() ? profilePosts({ data }) : posts({ data }));

        if (_data.pipe === POST_REPLY) {
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
      }
      case 'POST_REPOST': {
        const data = {
          data: [{ ...postState, ..._data, sender: userData }],
          statusText: 'new post created'
        };

        if (_data.action_count !== undefined) dispatch(createPost(_data));

        dispatch(inProfile() ? profilePosts({ ...data }) : posts({ ...data }));
        dispatch(
          makeRepost({
            err: false,
            status: 'fulfilled'
          })
        );
        displayModal(false);
        window.history.back();

        if (notificationSound.isPlaying) {
          promisedDispatch(
            triggerNotificationSound({ play: false, isPlaying: false })
          ).then(() => {
            dispatch(triggerNotificationSound({ play: true, toneName }));
          });
        } else {
          dispatch(triggerNotificationSound({ play: true, toneName }));
        }

        if (_data.error) {
          dispatch(
            makeRepost({
              err: true,
              status: 'settled',
              statusText: _data.message
            })
          );
        }

        break;
      }
      default:
        break;
    }
  } catch (e) {}
}
