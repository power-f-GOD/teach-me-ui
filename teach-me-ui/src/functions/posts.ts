import { sendReactionToServer, fetchPosts } from '../actions';
import { dispatch } from './utils';

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
