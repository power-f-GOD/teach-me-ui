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
      offset = data?.slice(-1)[0]?.date ?? Date.now();

      if (error) {
        dispatch(posts({ status: 'settled', statusText: message, err: true }));
      } else {
        if (isRecycling && !data.length) {
          return dispatch(
            posts({
              status: 'fulfilled',
              statusText: 'has reached end'
            })
          );
        }

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
            return;
          }
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
  const { data: _data, statusText } = _payload;
  const data = (_data ?? [])[0];
  const pipe = data?.pipe;
  let payload = { ...prevPostsState } as FetchState<PostStateProps[]>;
  const homeUnmounted = /(home\s?)unmount(s|ed)/.test(statusText || '');
  const hadReachedEnd = /reached\send/.test(prevPostsState.statusText || ''); //attempt to reset Posts to [] if it had reached end
  const newPostCreated = /(new\s)?post\screated/.test(statusText || '');
  const newData = _payload.data ?? [];
  const resultantData = homeUnmounted
    ? hadReachedEnd
      ? []
      : [...prevPostsState.data?.slice(-3)]
    : [...prevPostsState.data];
  const updateFromPipe = !!pipe;

  if (!updateFromPipe) {
    if (!homeUnmounted) {
      resultantData[newPostCreated ? 'unshift' : 'push'](...newData);
    }

    payload = {
      ..._payload,
      data: resultantData,
      extra: _payload.extra ?? prevPostsState.extra
    };
  } else {
    let { value: actualPost, index: postIndex } = loopThru(
      payload.data ?? [],
      ({ id }) =>
        id === data.id || id === data.parent_id || id === data.parent?.id,
      { type: 'find', includeIndex: true }
    ) as LoopFind<PostStateProps>;

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
          actualPost.numRepliesToShow = (actualPost.numRepliesToShow ?? 3) + 1;
          actualPost.reply_count = data.parent!.reply_count;
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
