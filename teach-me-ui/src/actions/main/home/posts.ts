import {
  PostStateProps,
  FetchState,
  SET_POSTS,
  ReduxActionV2,
  GET_POSTS,
  LoopFind,
  POST_REACTION,
  POST_REPLY
} from '../../../constants';

import {
  getState,
  checkNetworkStatusWhilstPend,
  logError,
  http,
  loopThru
} from '../../../functions';

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
  const isRecycling = /recycl(e|ing)/i.test(statusText || '');
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
      // console.log(data, offset, url);
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
  const { posts: prevPostsState } = getState() as {
    posts: FetchState<PostStateProps[]>;
  };
  const { data } = _payload;
  const pipe = (data ?? [])[0]?.pipe;
  let payload = { ...prevPostsState } as FetchState<PostStateProps[]>;
  const updateFromPipe = !!pipe;

  if (!updateFromPipe) {
    payload = {
      ..._payload,
      data: [...prevPostsState.data, ...(_payload.data ?? [])],
      extra: _payload.extra ?? prevPostsState.extra
    };
  } else {
    const data = _payload.data![0];
    let { value: actualPost, index: postIndex } = loopThru(
      payload.data ?? [],
      (post) =>
        post.id === data.id ||
        post.id === data.parent_id ||
        post.id === data.parent.id,
      { type: 'find', includeIndex: true }
    ) as LoopFind<PostStateProps>;

    // console.log(actualPost, postIndex, data);
    if (actualPost) {
      switch (pipe) {
        case POST_REACTION:
          if (data.parent_id && actualPost.sec_type !== 'REPLY') {
            let {
              value: actualReply,
              index: replyIndex
            } = loopThru(
              actualPost.colleague_replies ?? [],
              (reply) => reply.id === data.id,
              { type: 'find', includeIndex: true }
            ) as LoopFind<PostStateProps>;

            actualPost.colleague_replies[replyIndex] = {
              ...actualReply,
              ...data
            };
          } else {
            actualPost = { ...actualPost, ...data };
          }

          payload.data![postIndex] = actualPost;

          break;
        case POST_REPLY:
          actualPost.colleague_replies.push({
            ...data,
            upvote_count: 0,
            downvote_count: 0
          });
          actualPost.reply_count = data.parent.reply_count;
          payload.data![postIndex] = actualPost;
          break;
      }
    }
  }

  return {
    type: SET_POSTS,
    payload
  };
};
