import { dispatch, getState, promisedDispatch, inProfile } from '../functions';

import {
  posts,
  triggerNotificationSound,
  makeRepost,
  profilePosts,
  createPost
} from '../actions';

import { displayModal } from '../functions';

import { 
  postState,
  POST_REACTION, 
  POST_REPLY, 
  POST_REPOST,
  TONE_NAME__OPEN_ENDED 
} from '../constants';

import { SocketPipe, NotificationSoundState, UserData } from '../types';

export default function post(_data: any) {
  const { notificationSound, userData } = getState() as {
    notificationSound: NotificationSoundState;
    userData: UserData;
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
      case POST_REPOST: {
        if (!_data.error) {
          const data = {
            data: [{ ...postState, ..._data, sender: userData }],
            statusText: 'new post created'
          };

          if (_data.action_count !== undefined) dispatch(createPost(_data));

          dispatch(inProfile() ? profilePosts({ ...data }) : posts({ ...data }));
          if (_data.sender.id === userData.id) {
            dispatch(
              posts({
                data: [{ ...postState, ..._data, pipe: undefined }],
                statusText: 'new post created'
              })
            );
          
            // if (data.action_count !== undefined) dispatch(createPost(data));
            dispatch(
              makeRepost({
                err: false,
                status: 'fulfilled'
              })
            );
      
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

        } else {
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
