import { dispatch } from '../functions';

import {
  replyToPost,
  makeRepostResolved,
  makeRepostRejected,
  updateRepostData,
  createPost,
  posts
} from '../actions';

import { displayModal } from '../functions';

import { SocketPipe, RepostResult } from '../constants';

export default function post(data: any) {
  // console.log(data);
  try {
    switch (data.pipe as SocketPipe) {
      case 'POST_REACTION':
        dispatch(posts({ data: [{ ...data }] }));
        break;
      case 'POST_REPOST':
        if (!data.error) {
          if (data.count !== undefined) {
            dispatch(updateRepostData(data as RepostResult));
          }
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
      case 'POST_REPLY':
        if (!data.error) {
          dispatch(
            replyToPost({
              status: 'fulfilled',
              err: false,
              data
            })
          );
        } else {
          dispatch(
            replyToPost({
              status: 'fulfilled',
              err: true,
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
