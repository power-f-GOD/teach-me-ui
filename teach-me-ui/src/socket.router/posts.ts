import { dispatch } from '../functions';

import { updatePost } from '../actions';

import { PostReactionResult, SocketPipe } from '../constants';

export default function postRouter(data: any) {
  try {
    switch (data.pipe as SocketPipe) {
      case 'POST_REACTION':
        dispatch(updatePost(data as PostReactionResult));
        break;
      default:
        break;
    }
  } catch (e) {}
}
