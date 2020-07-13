import {
  ReduxAction,
  CREATE_POST,
  REACT_TO_POST,
  FETCHED_POSTS,
  FETCH_POST_STARTED,
  FETCH_POST_REJECTED,
  FETCH_POST_RESOLVED,
  PostPropsState,
  ReactPostState,
  FetchPostsState,
  fetchPostsState
} from '../constants';

import { resultantReaction } from '../functions';

export const posts = (
  state: Array<PostPropsState> = [],
  action: ReduxAction
): Array<PostPropsState> => {
  if (action.type === CREATE_POST) return createPost(state, action.payload);
  else if (action.type === REACT_TO_POST)
    return reactToPost(state, action.payload);
  else if (action.type === FETCHED_POSTS) return [...action.payload, ...state];
  else return state;
};

export const fetchPostStatus = (
  state: FetchPostsState = fetchPostsState,
  action: ReduxAction
) => {
  switch (action.type) {
    case FETCH_POST_REJECTED:
    case FETCH_POST_RESOLVED:
    case FETCH_POST_STARTED:
      return action.payload;
    default:
      return state;
  }
};

const createPost = (
  state: Array<PostPropsState>,
  post: PostPropsState
): Array<PostPropsState> => {
  return [post, ...state];
};

const reactToPost = (
  state: Array<PostPropsState>,
  reaction: ReactPostState
): Array<PostPropsState> => {
  return state.map((post) => {
    const resolvedReaction = resultantReaction(post.reaction, reaction.type);
    return (post.id as string) === reaction.id
      ? {
          ...post,
          reaction: resolvedReaction,
          downvotes:
            post.reaction === 'downvote' && resolvedReaction === 'neutral'
              ? post.downvotes - 1
              : resolvedReaction === 'downvote'
              ? post.downvotes + 1
              : post.downvotes === 0
              ? 0
              : post.downvotes - 1,
          upvotes:
            post.reaction === 'upvote' && resolvedReaction === 'neutral'
              ? post.upvotes - 1
              : resolvedReaction === 'upvote'
              ? post.upvotes + 1
              : post.upvotes === 0
              ? 0
              : post.upvotes - 1
        }
      : post;
  });
};
