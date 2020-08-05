import { dispatch } from '../functions';

import { updatePost, replyToPost } from '../actions';

import { PostReactionResult, SocketPipe } from '../constants';

export default function postRouter(data: any) {
  try {
    switch (data.pipe as SocketPipe) {
      case 'POST_REACTION':
        dispatch(updatePost(data as PostReactionResult));
        break;
      case 'POST_REPLY':
          if (!data.error ) {
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
