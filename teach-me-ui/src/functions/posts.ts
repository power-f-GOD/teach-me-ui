import { reactToPost, fetchPosts } from '../actions';
import { dispatch } from './utils';

export const reactToPostFn = (
  id: number,
  type: 'upvote' | 'downvote' | 'neutral'
) => {
  dispatch(reactToPost({ type, id }));
};

export const fetchPostsFn = () => {
  dispatch(fetchPosts());
};
