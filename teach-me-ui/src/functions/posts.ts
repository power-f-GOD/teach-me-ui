import { reactToPost, fetchPosts } from '../actions';
import { dispatch } from './utils';

export const reactToPostFn = (
  id: string,
  type: 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL'
) => {
  dispatch(reactToPost({ type, id }));
};

export const fetchPostsFn = () => {
  dispatch(fetchPosts());
};
