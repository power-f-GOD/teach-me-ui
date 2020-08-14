import { 
  sendReactionToServer, 
  sendReplyToServer, 
  fetchPosts 
} from '../actions';

import { dispatch } from './utils';

import { Post } from '../constants';

export const replyToPostFn = async (
  id: string,
  reply: Post
) => {
  await dispatch(
    sendReplyToServer({
      ...reply,
      pipe: 'POST_REPLY',
      post_id: id,
    })
  )
}

export const reactToPostFn = (
  id: string,
  type: 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL'
) => {
  dispatch(
    sendReactionToServer({
      post_id: id,
      reaction: type as 'UPVOTE' | 'DOWNVOTE',
      pipe: 'POST_REACTION'
    })
  );
};

export const fetchPostsFn = (type: 'FEED' | 'WALL', userId?: string) => {
  dispatch(fetchPosts(type, userId));
};
