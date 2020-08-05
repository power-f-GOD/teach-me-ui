import {
  replyState,
  ReduxAction,
  CREATE_POST,
  REACT_TO_POST,
  UPDATE_POST,
  FETCHED_POSTS,
  FETCH_POST_STARTED,
  FETCH_POST_REJECTED,
  FETCH_POST_RESOLVED,
  PostPropsState,
  ReactPostState,
  FetchPostsState,
  fetchPostsState,
  PostReactionResult,
  Reaction,
  REPLY_TO_POST,
  ReplyState
} from '../constants';

import { resultantReaction } from '../functions';

export const posts = (
  state: Array<PostPropsState> = [],
  action: ReduxAction
): Array<PostPropsState> => {
  if (action.type === CREATE_POST) return createPost(state, action.payload);
  else if (action.type === REACT_TO_POST)
    return reactToPost(state, action.payload);
  else if (action.type === UPDATE_POST)
    return updatePost(state, action.payload);
  else if (action.type === FETCHED_POSTS) return [...action.payload];
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
  return state.map((post): any => {
    const downvotes = (post: any, resolvedReaction: Reaction) =>
      post.reaction === 'DOWNVOTE' && resolvedReaction === 'NEUTRAL'
        ? post.downvotes - 1
        : resolvedReaction === 'DOWNVOTE'
        ? post.downvotes + 1
        : post.reaction === 'DOWNVOTE' && resolvedReaction === 'UPVOTE'
        ? post.downvotes - 1
        : post.downvotes === 0
        ? 0
        : post.downvotes;
    const upvotes = (post: any, resolvedReaction: Reaction) =>
      post.reaction === 'UPVOTE' && resolvedReaction === 'NEUTRAL'
        ? post.upvotes - 1
        : resolvedReaction === 'UPVOTE'
        ? post.upvotes + 1
        : post.reaction === 'UPVOTE' && resolvedReaction === 'DOWNVOTE'
        ? post.upvotes - 1
        : post.upvotes === 0
        ? 0
        : post.upvotes;
    return (post.id as string) === reaction.id
      ? {
          ...post,
          reaction: resultantReaction(post.reaction, reaction.type),
          upvotes: upvotes(
            post,
            resultantReaction(post.reaction, reaction.type)
          ),
          downvotes: downvotes(
            post,
            resultantReaction(post.reaction, reaction.type)
          )
        }
      : (post.parent?.id as string) === reaction.id
      ? {
          ...post,
          parent: {
            ...post.parent,
            reaction: resultantReaction(post.parent?.reaction, reaction.type),
            upvotes: upvotes(
              post.parent,
              resultantReaction(post.parent?.reaction, reaction.type)
            ),
            downvotes: downvotes(
              post.parent,
              resultantReaction(post.parent?.reaction, reaction.type)
            )
          }
        }
      : post;
  });
};

const updatePost = (
  state: Array<PostPropsState>,
  result: PostReactionResult
): Array<PostPropsState> => {
  return state.map((post): any => {
    return (post.id as string) === result.id
      ? {
          ...post,
          upvotes: result.upvotes,
          downvotes: result.downvotes
        }
      : (post.parent?.id as string) === result.id
      ? {
          ...post,
          parent: {
            ...post.parent,
            upvotes: result.upvotes,
            downvotes: result.downvotes
          }
        }
      : post;
  });
};

export const replyToPost = (
  state: ReplyState = replyState,
  action: ReduxAction
) => {
  if (action.type === REPLY_TO_POST) {
    return {
      ...state,
      ...action.payload
    };
  };
  return state;
};