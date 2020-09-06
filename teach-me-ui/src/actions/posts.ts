import {
  ReduxAction,
  REACT_TO_POST,
  UPDATE_REPOST,
  UPDATE_POST,
  FETCH_POST_REJECTED,
  FETCH_POST_RESOLVED,
  FETCH_POST_STARTED,
  FETCH_A_POST_REJECTED,
  FETCH_A_POST_RESOLVED,
  FETCH_A_POST_STARTED,
  MAKE_REPOST_REJECTED,
  MAKE_REPOST_RESOLVED,
  MAKE_REPOST_STARTED,
  FETCHED_POSTS,
  FETCHED_MORE_POSTS,
  FETCHED_POST,
  REPLY_TO_POST,
  SEND_REPLY_TO_SERVER,
  PostPropsState,
  ReactPostState,
  FetchPostsState,
  MakeRepostState,
  apiBaseURL as baseURL,
  UserData,
  SocketProps,
  PostReactionResult,
  RepostResult,
  Reaction,
  ReplyState,
  CREATE_POST
} from '../constants';

import { getState, callNetworkStatusCheckerFor } from '../functions';

import Axios from 'axios';

export const replyToPost = (payload: ReplyState) => {
  return {
    type: REPLY_TO_POST,
    payload
  };
};

export const sendReplyToServer = (payload: SocketProps) => (
  dispatch: Function
) => {
  callNetworkStatusCheckerFor({
    name: 'replyToPost',
    func: replyToPost
  });

  dispatch(
    replyToPost({
      status: 'pending'
    })
  );
  const socket: WebSocket = getState().webSocket as WebSocket;
  socket.send(JSON.stringify({ ...payload }));
  return {
    type: SEND_REPLY_TO_SERVER
  };
};

export const updatePost = (payload: PostReactionResult): ReduxAction => {
  return { type: UPDATE_POST, payload };
};

export const createPost = (payload: PostPropsState): ReduxAction => {
  return { type: CREATE_POST, payload };
};

export const updateRepostData = (payload: RepostResult): ReduxAction => {
  return { type: UPDATE_REPOST, payload };
};

const reactToPost = (payload: ReactPostState): ReduxAction => {
  return { type: REACT_TO_POST, payload };
};

export const sendReactionToServer = (payload: SocketProps) => (
  dispatch: Function
) => {
  dispatch(
    reactToPost({ id: payload.post_id, type: payload.reaction as Reaction })
  );
  const posts: Array<PostPropsState> = getState().posts;
  const singlePost: PostPropsState = getState().singlePost;

  let post = posts.find((post: PostPropsState) =>
    (post.id as string) === payload.post_id
      ? post
      : (post.parent?.id as string) === payload.post_id
      ? post.parent
      : undefined
  );
  if (post === undefined) {
    post =
      (singlePost.id as string) === payload.post_id
        ? singlePost
        : (singlePost.parent?.id as string) === payload.post_id
        ? (singlePost.parent as PostPropsState)
        : undefined;
  }
  if (post === undefined) return;
  const socket: WebSocket = getState().webSocket as WebSocket;
  socket.send(JSON.stringify({ ...payload, reaction: post?.reaction }));
};

export const makeRepost = (payload: SocketProps) => (dispatch: Function) => {
  dispatch(makeRepostStarted());

  const socket = getState().webSocket as WebSocket;
  socket.send(JSON.stringify(payload));
};

export const makeRepostStarted = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const makeRepostResolved = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const makeRepostRejected = (
  payload?: Partial<MakeRepostState>
): ReduxAction => {
  return {
    type: MAKE_REPOST_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchPosts: Function = (
  type: 'FEED' | 'WALL',
  userId?: string,
  update = false,
  cb = (s: boolean) => {}
) => (dispatch: Function) => {
  cb(true);
  if (!update) dispatch(fetchPostsStarted());
  const isWall = type === 'WALL' && !!userId;
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: isWall ? `/profile/${userId}/posts` : '/feed',
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.posts;
    })
    .then((state) => {
      if (state.length === 0) {
        console.log('recycling feeds...');
        dispatch(recycleFeeds(cb));
        return;
      }
      if (update) {
        dispatch(fetchedMorePosts(state as Array<PostPropsState>));
      } else {
        dispatch(fetchedPosts(state as Array<PostPropsState>));
        dispatch(
          fetchPostsResolved({
            error: false,
            message: 'Fetch posts successful'
          })
        );
      }
      cb(false);
    })
    .catch((err) => {
      dispatch(fetchPostsRejected({ error: true, message: err.message }));
    });
};

export const recycleFeeds = (cb = (s: boolean) => {}) => (
  dispatch: Function
) => {
  const userData = getState().userData as UserData;
  // const lastPost = getState().posts[1] as PostPropsState;
  const token = userData.token as string;
  Axios({
    url: `/feed/recycle`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.posts;
    })
    .then((state) => {
      dispatch(fetchedMorePosts(state as Array<PostPropsState>));
      dispatch(
        fetchPostsResolved({
          error: false,
          message: 'Fetch posts successful'
        })
      );
      cb(false);
    })
    .catch((err) => {
      dispatch(fetchPostsRejected({ error: true, message: err.message }));
    });
};

export const fetchReplies = (postId?: string) => (dispatch: Function) => {
  dispatch(fetchPostsStarted());
  const userData = getState().userData as UserData;
  const headers =
    userData && userData.token
      ? { Authorization: `Bearer ${userData.token}` }
      : {};
  Axios({
    url: `/post/${postId}/replies?limit=10&skip=0`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.replies;
    })
    .then((state) => {
      dispatch(fetchedPosts(state as Array<PostPropsState>));
      dispatch(
        fetchPostsResolved({ error: false, message: 'Fetch posts successful' })
      );
    })
    .catch((err) => {
      dispatch(fetchPostsRejected({ error: true, message: err.message }));
    });
};

export const fetchPost: Function = (postId?: string) => (
  dispatch: Function
) => {
  dispatch(fetchPostStarted());
  const userData = getState().userData as UserData;
  const headers =
    userData && userData.token
      ? { Authorization: `Bearer ${userData.token}` }
      : {};
  Axios({
    url: `/post/${postId}`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data;
    })
    .then((state) => {
      dispatch(fetchedPost(state as PostPropsState));
      dispatch(
        fetchPostResolved({ error: false, message: 'Fetch posts successful' })
      );
    })
    .catch((err) => {
      dispatch(fetchPostRejected({ error: true, message: err.message }));
    });
};

export const fetchedPosts = (payload: Array<PostPropsState>): ReduxAction => {
  return {
    type: FETCHED_POSTS,
    payload
  };
};
export const fetchedMorePosts = (
  payload: Array<PostPropsState>
): ReduxAction => {
  return {
    type: FETCHED_MORE_POSTS,
    payload
  };
};

export const fetchedPost = (payload: PostPropsState): ReduxAction => {
  return {
    type: FETCHED_POST,
    payload
  };
};

const fetchPostsStarted = (payload?: Partial<FetchPostsState>): ReduxAction => {
  return {
    type: FETCH_POST_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
const fetchPostsResolved = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: FETCH_POST_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
const fetchPostsRejected = (
  payload?: Partial<FetchPostsState>
): ReduxAction => {
  return {
    type: FETCH_POST_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

const fetchPostStarted = (payload?: Partial<FetchPostsState>): ReduxAction => {
  return {
    type: FETCH_A_POST_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
const fetchPostResolved = (payload?: Partial<FetchPostsState>): ReduxAction => {
  return {
    type: FETCH_A_POST_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
const fetchPostRejected = (payload?: Partial<FetchPostsState>): ReduxAction => {
  return {
    type: FETCH_A_POST_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};
