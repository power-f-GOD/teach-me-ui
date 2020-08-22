import { dispatch } from '../functions';

import {
  updatePost,
  replyToPost,
  makeRepostResolved,
  makeRepostRejected,
  updateRepostData
  // createPost
} from '../actions';

import { displayModal } from '../functions';

import { PostReactionResult, SocketPipe, RepostResult } from '../constants';

export default function post(data: any) {
  try {
    switch (data.pipe as SocketPipe) {
      case 'POST_REACTION':
        dispatch(updatePost(data as PostReactionResult));
        break;
      case 'POST_REPOST':
        console.log(data);
        if (!data.error) {
          if (data.count !== undefined) {
            dispatch(updateRepostData(data as RepostResult));
          }
          // dispatch(createPost(data));
          dispatch(
            makeRepostResolved({
              error: false,
              message: 'Repost was made successfully'
            })
          );
          dispatch(displayModal(false));
        } else {
          dispatch(makeRepostRejected({ error: true, message: data.message }));
        }
        break;
      case 'POST_REPLY':
        if (!data.error) {
          dispatch(
            replyToPost({
              status: 'fulfilled',
              error: false,
              data
            })
          );
        } else {
          dispatch(
            replyToPost({
              status: 'fulfilled',
              error: true,
              data
            })
          );
        }
        break;
      default:
        break;
    }
  } catch (e) {}
}
