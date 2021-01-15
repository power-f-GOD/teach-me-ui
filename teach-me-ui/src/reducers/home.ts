import {
  replyState,
  ReduxAction,
  PostStateProps,
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

export const replyToPost = (
  state: ReplyState = replyState,
  action: ReduxActionV2<ReplyState>
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
