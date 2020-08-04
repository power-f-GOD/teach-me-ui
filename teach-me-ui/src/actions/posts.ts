import {
  ReduxAction,
  REACT_TO_POST,
  FETCH_POST_REJECTED,
  UPDATE_POST,
  FETCH_POST_RESOLVED,
  FETCH_POST_STARTED,
  FETCHED_POSTS,
  PostPropsState,
  ReactPostState,
  FetchPostsState,
  apiBaseURL as baseURL,
  UserData,
  SocketProps,
  PostReactionResult,
  Reaction
} from '../constants';

import { getState } from '../functions';

import Axios from 'axios';

// export const createPost = (payload: PostPropsState): ReduxAction => {
//   return { type: CREATE_POST, payload };
// };

export const updatePost = (payload: PostReactionResult): ReduxAction => {
  return { type: UPDATE_POST, payload };
};

export const reactToPost = (payload: ReactPostState): ReduxAction => {
  return { type: REACT_TO_POST, payload };
};

export const sendReactionToServer = (payload: SocketProps) => (
  dispatch: Function
) => {
  dispatch(
    reactToPost({ id: payload.post_id, type: payload.reaction as Reaction })
  );
  const posts: Array<PostPropsState> = getState().posts;

  const post = posts.find((post: PostPropsState) =>
    (post.id as string) === payload.post_id
      ? post
      : (post.parent?.id as string) === payload.post_id
      ? post.parent
      : undefined
  );
  if (post === undefined) return;
  const socket: WebSocket = getState().webSocket as WebSocket;
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.pipe === 'POST_REACTION') {
        dispatch(updatePost(data as PostReactionResult));
      }
    } catch (e) {}
  });
  socket.send(JSON.stringify({ ...payload, reaction: post?.reaction }));
};

export const fetchPosts: Function = (
  type: 'FEED' | 'WALL',
  userId?: string
) => (dispatch: Function) => {
  dispatch(fetchPostsStarted());
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
      dispatch(fetchedPosts(state as Array<PostPropsState>));
      dispatch(
        fetchPostsResolved({ error: false, message: 'Fetch posts successful' })
      );
    })
    .catch((err) => {
      dispatch(fetchPostsRejected({ error: true, message: err.message }));
    });
};

const fetchedPosts = (payload: Array<PostPropsState>): ReduxAction => {
  return {
    type: FETCHED_POSTS,
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
