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
  MAKE_POST,
  SUBMIT_POST,
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
  CREATE_POST,
  Post,
  GET_TRENDS_RESOLVED,
  GET_TRENDS_STARTED,
  GET_TRENDS_REJECTED,
  GET_RECOMMENDATIONS_STARTED,
  GET_RECOMMENDATIONS_REJECTED,
  GET_RECOMMENDATIONS_RESOLVED,
  FETCHED_RECOMMENDATIONS,
  RequestState,
  FETCHED_TRENDS,
  FetchState,
  SET_POSTS,
  ReduxActionV2,
  GET_POSTS
} from '../constants';

import {
  getState,
  checkNetworkStatusWhilstPend,
  getCharacterSequenceFromText,
  logError,
  http
} from '../functions';

import axios from 'axios';
import { pingUser } from './notifications';

export const replyToPost = (payload: ReplyState) => {
  return {
    type: REPLY_TO_POST,
    payload
  };
};

export const sendReplyToServer = (payload: SocketProps) => (
  dispatch: Function
) => {
  checkNetworkStatusWhilstPend({
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
  // const posts: Array<PostPropsState> = getState().posts;
  // const singlePost: PostPropsState = getState().singlePost;

  // let post = posts.find((post: PostPropsState) =>
  //   (post.id as string) === payload.post_id
  //     ? post
  //     : (post.parent?.id as string) === payload.post_id
  //     ? post.parent
  //     : undefined
  // );
  // if (post === undefined) {
  //   post =
  //     (singlePost.id as string) === payload.post_id
  //       ? singlePost
  //       : (singlePost.parent?.id as string) === payload.post_id
  //       ? (singlePost.parent as PostPropsState)
  //       : undefined;
  // }
  // if (post === undefined) return;
  // const socket: WebSocket = getState().webSocket as WebSocket;
  // socket.send(JSON.stringify({ ...payload, reaction: post?.reaction }));
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

export const getPosts = (
  type: 'FEED' | 'WALL',
  userId?: string,
  update = false,
  statusText?: string,
  url?: string
) => (dispatch: Function): ReduxActionV2<any> => {
  const isWall = type === 'WALL' && !!userId;
  const payload = {
    status: 'pending',
    statusText,
    err: false
  } as FetchState<PostPropsState[]>;
  const isRecycling = /recycl/i.test(statusText || '');
  const isFetching = /fetching/i.test(statusText || '');
  let offset = getState()._posts.extra;

  if (update) delete payload.status;

  dispatch(posts(payload));
  checkNetworkStatusWhilstPend({
    name: 'posts',
    func: posts
  });

  http
    .get<PostPropsState[]>(
      isWall
        ? `/profile/${userId}/posts`
        : url
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}`)}`
        : '/feed',
      true
    )
    .then(({ error, message, data: _posts }) => {
      // console.log(_posts, offset, url);
      offset = _posts.slice(-1)[0]?.date ?? Date.now();

      if (error) {
        dispatch(posts({ status: 'settled', statusText: message, err: true }));
      } else {
        if (!_posts.length && type === 'FEED') {
          // recursively get (recycled) Posts if no post is returned
          if (!isRecycling && isFetching) {
            dispatch(
              getPosts(
                type,
                userId,
                update,
                'fetching recycled posts',
                `/feed?recycle=true&offset=`
              )
            );
          }

          return;
        }

        dispatch(
          posts({
            status: 'fulfilled',
            statusText: '',
            err: false,
            data: [..._posts],
            extra: offset //'extra', here, is 'offset' for purpose of recycling
          })
        );
      }
    })
    .catch(logError(posts));

  return {
    type: GET_POSTS
  };
};

export const posts = (_payload: FetchState<PostPropsState[], number>) => {
  const { _posts: posts } = getState() as {
    _posts: FetchState<PostPropsState[]>;
  };

  return {
    type: SET_POSTS,
    payload: {
      ..._payload,
      data: [...posts.data, ...(_payload.data ?? [])],
      extra: _payload.extra ?? posts.extra
    }
  };
};

export const fetchReplies = (postId?: string) => (dispatch: Function) => {
  dispatch(fetchPostsStarted());
  const userData = getState().userData as UserData;
  const headers =
    userData && userData.token
      ? { Authorization: `Bearer ${userData.token}` }
      : {};
  axios({
    url: `/post/${postId}/replies?limit=10&skip=0`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data.replies;
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

  axios({
    url: `/post/${postId}`,
    baseURL,
    method: 'GET',
    headers
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
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

export const makePost = (payload: any): ReduxAction => {
  return {
    type: MAKE_POST,
    payload
  };
};

export const submitPost = ({
  post,
  media
}: {
  post: Post;
  media: Array<string>;
}) => (dispatch: Function) => {
  dispatch(
    makePost({
      status: 'pending'
    })
  );
  const token = (getState().userData as UserData).token;
  const addPost = (payload: any) => {
    window.scrollTo(0, 0);
    dispatch(createPost(payload));
  };

  checkNetworkStatusWhilstPend({
    name: 'makePost',
    func: makePost
  });

  axios({
    url: `post/make`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Content_Type: 'application/json'
    },
    data: {
      text: post.text,
      mentions: getCharacterSequenceFromText(post.text, '@'),
      hashtags: getCharacterSequenceFromText(post.text, '#'),
      media
    }
  })
    .then(({ data }) => {
      addPost(data.data);
      dispatch(
        makePost({
          status: 'fulfilled'
        })
      );
      getCharacterSequenceFromText(post.text, '@') &&
        pingUser(getCharacterSequenceFromText(post.text, '@'));
    })
    .catch(logError(makePost));
  return {
    type: SUBMIT_POST
  };
};

export const getTrendsStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_TRENDS_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const getTrendsResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_TRENDS_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const getTrendsRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_TRENDS_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchedTrends = (payload?: Partial<RequestState>): ReduxAction => {
  return {
    type: FETCHED_TRENDS,
    payload
  };
};

export const getTrends = () => (dispatch: Function) => {
  dispatch(getTrendsStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  axios({
    url: `/hashtag/trending`,
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
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchedTrends(state.hashtags));
      dispatch(
        getTrendsResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(getTrendsRejected({ error: true, message: err.message }));
    });
};

export const getRecommendationsStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_RECOMMENDATIONS_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const getRecommendationsResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_RECOMMENDATIONS_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const getRecommendationsRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: GET_RECOMMENDATIONS_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchedRecommendations = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCHED_RECOMMENDATIONS,
    payload
  };
};

export const getRecommendations = () => (dispatch: Function) => {
  dispatch(getRecommendationsStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  axios({
    url: `/people/recommendations`,
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
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchedRecommendations(state.recommendations));
      dispatch(
        getRecommendationsResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(
        getRecommendationsRejected({ error: true, message: err.message })
      );
    });
};
