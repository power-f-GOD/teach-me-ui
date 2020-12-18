import {
  replyState,
  ReduxAction,
  REACT_TO_POST,
  UPDATE_POST,
  UPDATE_REPOST,
  FETCHED_POST,
  MAKE_REPOST_STARTED,
  MAKE_REPOST_REJECTED,
  MAKE_REPOST_RESOLVED,
  PostStateProps,
  ReactPostState,
  MakeRepostState,
  makeRepostState,
  PostReactionResult,
  RepostResult,
  Reaction,
  REPLY_TO_POST,
  MAKE_POST,
  ReplyState,
  makePostState,
  MakePostState,
  FetchState,
  ReduxActionV2,
  SET_POSTS,
  SET_RECOMMENDATIONS,
  UserData,
  fetchState,
  HashTag,
  SET_TRENDS
} from '../constants';

import { resultantReaction } from '../functions';

export const posts = (
  state = { ...fetchState } as FetchState<PostStateProps[]>,
  { type, payload }: ReduxActionV2<FetchState<PostStateProps>>
) => {
  if (type === SET_POSTS) {
    return { ...state, ...payload };
  }

  return state;
};

export const recommendations = (
  state = { ...fetchState } as FetchState<UserData[]>,
  { type, payload }: ReduxActionV2<FetchState<PostStateProps>>
) => {
  if (type === SET_RECOMMENDATIONS) {
    return { ...state, ...payload };
  }

  return state;
};

export const trends = (
  state = { ...fetchState } as FetchState<HashTag[]>,
  { type, payload }: ReduxActionV2<FetchState<HashTag[]>>
) => {
  if (type === SET_TRENDS) {
    return { ...state, ...payload };
  }

  return state;
};

export const singlePost = (
  state: Partial<PostStateProps> = {},
  action: ReduxAction
): PostStateProps => {
  if (action.type === REACT_TO_POST) {
    return reactToPost([state as PostStateProps], action.payload)[0];
  } else if (action.type === UPDATE_POST) {
    return updatePost([state as PostStateProps], action.payload)[0];
  } else if (action.type === FETCHED_POST) return action.payload;
  else if (action.type === UPDATE_REPOST)
    return updateReposts([state as PostStateProps], action.payload)[0];
  else return state as PostStateProps;
};

export const makeRepostStatus = (
  state: MakeRepostState = makeRepostState,
  action: ReduxAction
) => {
  switch (action.type) {
    case MAKE_REPOST_REJECTED:
    case MAKE_REPOST_RESOLVED:
    case MAKE_REPOST_STARTED:
      return action.payload;
    default:
      return state;
  }
};

const reactToPost = (
  state: Array<PostStateProps>,
  reaction: ReactPostState
): Array<PostStateProps> => {
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
      : // (post.parent?.id as string) === reaction.id
        // ? {
        //     ...post,
        //     parent: {
        //       ...post.parent,
        //       reaction: resultantReaction(post.parent?.reaction, reaction.type),
        //       upvotes: upvotes(
        //         post.parent,
        //         resultantReaction(post.parent?.reaction, reaction.type)
        //       ),
        //       downvotes: downvotes(
        //         post.parent,
        //         resultantReaction(post.parent?.reaction, reaction.type)
        //       )
        //     }
        //   }
        // :
        post;
  });
};

const updatePost = (
  state: Array<PostStateProps>,
  result: PostReactionResult
): Array<PostStateProps> => {
  return state.map((post): any => {
    return (post.id as string) === result.id
      ? {
          ...post,
          upvotes: result.upvotes,
          downvotes: result.downvotes
        }
      : // (post.parent?.id as string) === result.id
        // ? {
        //     ...post,
        //     parent: {
        //       ...post.parent,
        //       upvotes: result.upvotes,
        //       downvotes: result.downvotes
        //     }
        //   }
        // :
        post;
  });
};

const updateReposts = (
  state: Array<PostStateProps>,
  result: RepostResult
): Array<PostStateProps> => {
  return state.map((post): any => {
    return (post.id as string) === result.id
      ? {
          ...post,
          reposts: result.count
        }
      : // (post.parent?.id as string) === result.id
        // ? {
        //     ...post,
        //     parent: {
        //       ...post.parent,
        //       reposts: result.count
        //     }
        //   }
        // :
        post;
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
  }
  return state;
};

export const makePost = (
  state: MakePostState = makePostState,
  action: ReduxAction
) => {
  if (action.type === MAKE_POST) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
