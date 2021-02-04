import { dispatch, getState, promisedDispatch } from '../functions';

import {
  posts,
  triggerNotificationSound,
  makeRepost
} from '../actions';

import { displayModal } from '../functions';

import { 
  postState,
  POST_REACTION, 
  POST_REPLY, 
  POST_REPOST,
  TONE_NAME__OPEN_ENDED 
} from '../constants';

import { SocketPipe, NotificationSoundState } from '../types';


export default function post(data: any) {
  const { notificationSound } = getState() as {
    notificationSound: NotificationSoundState;
  };
  const toneName: NotificationSoundState['toneName'] = TONE_NAME__OPEN_ENDED;

  try {
    switch (data.pipe as SocketPipe) {
      case POST_REACTION:
      case POST_REPLY:
        dispatch(posts({ data: [{ ...data }] }));
        // console.log('data from server:', data);

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
      case POST_REPOST:
        if (!data.error) {
          const { userData } = getState();
          console.log(data)
          if (data.sender.id === userData.id) {
            dispatch(
              posts({
                data: [{ ...postState, ...data, pipe: undefined }],
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
            dispatch(displayModal(false));
          }
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
