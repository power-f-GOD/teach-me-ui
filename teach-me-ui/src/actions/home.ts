import {
  ReduxAction,
  REACT_TO_POST,
  UPDATE_REPOST,
  UPDATE_POST,
  MAKE_REPOST_REJECTED,
  MAKE_REPOST_RESOLVED,
  MAKE_REPOST_STARTED,
  REPLY_TO_POST,
  MAKE_POST,
  SUBMIT_POST,
  SEND_REPLY_TO_SERVER,
  PostStateProps,
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
  FetchState,
  SET_POSTS,
  ReduxActionV2,
  GET_POSTS,
  LoopFind,
  POST_REACTION,
  SET_RECOMMENDATIONS,
  GET_RECOMMENDATIONS,
  SET_TRENDS,
  GET_TRENDS
} from '../constants';

import {
  getState,
  checkNetworkStatusWhilstPend,
  getCharacterSequenceFromText,
  logError,
  http,
  loopThru
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

export const createPost = (payload: PostStateProps): ReduxAction => {
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
  } as FetchState<PostStateProps[]>;
  const isRecycling = /recycl/i.test(statusText || '');
  const isFetching = /fetching/i.test(statusText || '');
  let offset = getState().posts.extra;

  if (update) delete payload.status;

  dispatch(posts(payload));
  checkNetworkStatusWhilstPend({
    name: 'posts',
    func: posts
  });

  http
    .get<PostStateProps[]>(
      isWall
        ? `/profile/${userId}/posts`
        : url
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}`)}`
        : '/feed',
      true
    )
    .then(({ error, message, data }) => {
      // console.log(_posts, offset, url);
      offset = data.slice(-1)[0]?.date ?? Date.now();

      if (error) {
        dispatch(posts({ status: 'settled', statusText: message, err: true }));
      } else {
        if (!data.length && type === 'FEED') {
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
            data,
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

export const posts = (_payload: FetchState<PostStateProps[], number>) => {
  const { posts } = getState() as {
    posts: FetchState<PostStateProps[]>;
  };
  const { data } = _payload;
  const pipe = (data ?? [])[0]?.pipe;
  let payload = { ...posts } as FetchState<PostStateProps[]>;
  const updateFromPipe = !!pipe;

  if (!updateFromPipe) {
    payload = {
      ..._payload,
      data: [...posts.data, ...(_payload.data ?? [])],
      extra: _payload.extra ?? posts.extra
    };
  } else if (updateFromPipe) {
    const data = _payload.data![0];
    let { value: initialPost, index: postIndex } = loopThru(
      posts.data ?? [],
      (post) => post.id === data.id || post.id === data.parent_id,
      { type: 'find', includeIndex: true }
    ) as LoopFind<PostStateProps>;

    switch (pipe) {
      case POST_REACTION:
        if (initialPost) {
          if (data.parent_id && initialPost.sec_type !== 'REPLY') {
            let {
              value: initialReply,
              index: replyIndex
            } = loopThru(
              initialPost.replies ?? [],
              (reply) => reply.id === data.id,
              { type: 'find', includeIndex: true }
            ) as LoopFind<PostStateProps>;

            initialPost.replies[replyIndex] = { ...initialReply, ...data };
          } else {
            initialPost = { ...initialPost, ...data };
          }

          payload.data![postIndex] = initialPost;
        }
        break;
    }
  }

  return {
    type: SET_POSTS,
    payload
  };
};

export const fetchReplies = (postId?: string) => (dispatch: Function) => {
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
    .then((state) => {})
    .catch((err) => {});
};

export const fetchPost: Function = (postId?: string) => (
  dispatch: Function
) => {
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
    .then((state) => {})
    .catch((err) => {});
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

export const getRecommendations = () => (dispatch: Function) => {
  checkNetworkStatusWhilstPend({
    name: 'recommendations',
    func: recommendations
  });

  http
    .get<UserData[]>('/people/recommendations', true)
    .then(({ error, message, data }) => {
      if (error) {
        dispatch(
          recommendations({ status: 'settled', statusText: message, err: true })
        );
      } else {
        dispatch(
          recommendations({
            status: 'fulfilled',
            statusText: message,
            err: false,
            data
          })
        );
      }
    })
    .catch(recommendations);

  return {
    type: GET_RECOMMENDATIONS
  };
};

export const recommendations = (payload: FetchState<UserData[]>) => {
  return {
    type: SET_RECOMMENDATIONS,
    payload
  };
};

export const getTrends = () => (dispatch: Function) => {
  checkNetworkStatusWhilstPend({
    name: 'trends',
    func: trends
  });

  http
    .get<UserData[]>('/hashtag/trending', true)
    .then(({ error, message, data }) => {
      if (error) {
        dispatch(trends({ status: 'settled', statusText: message, err: true }));
      } else {
        dispatch(
          trends({
            status: 'fulfilled',
            statusText: message,
            err: false,
            data
          })
        );
      }
    })
    .catch(trends);

  return {
    type: GET_TRENDS
  };
};

export const trends = (payload: FetchState<UserData[]>) => {
  return {
    type: SET_TRENDS,
    payload
  };
};
