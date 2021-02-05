import { dispatch, getState, promisedDispatch, inProfile } from '../functions';

import {
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
  TONE_NAME__OPEN_ENDED,
  POST_REPOST
} from '../constants';
import {
  SocketPipe,
  NotificationSoundState,
  PostStateProps,
  UserData
} from '../types';

export default function post(
  _data: { message: string; error: boolean } & Partial<PostStateProps>
) {
  const { notificationSound, userData } = getState() as {
    notificationSound: NotificationSoundState;
    userData: UserData;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;
  const senderIsSelf = userData.id === _data.sender?.id;

  // console.log('payload from server:', _data);
  try {
    switch (_data.pipe as SocketPipe) {
      case POST_REACTION:
      case POST_REPLY: {
        const data = [{ ..._data }] as PostStateProps[];

        dispatch(inProfile() ? profilePosts({ data }) : posts({ data }));
        break;
      }
      case POST_REPOST: {
        if (senderIsSelf) {
          const data = {
            data: [
              { ...postState, ..._data, sender: userData, pipe: undefined }
            ],
            statusText: 'new post created'
          };

          dispatch(
            inProfile() ? profilePosts({ ...data }) : posts({ ...data })
          );
          dispatch(
            makeRepost({
              err: false,
              status: 'fulfilled'
            })
          );

          // @Prince, instead of this check I'm currently temporarily doing, you should check if the modal is currently being displayed to dispatch this action else skip
          // And although, I've put a check in the action to test for the window location hash too which would prevent history.back() from being called unnecessarily
          displayModal(false);
        }

        break;
      }
      default:
        break;
    }
  } catch (e) {}

  if (senderIsSelf) {
    switch (_data.pipe) {
      case POST_REPLY:
      case POST_REPOST:
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
  }
}
