import {
  SET_POSTS,
  GET_POSTS,
  POST_REACTION,
  POST_REPLY
} from '../../../constants';
import {
  PostStateProps,
  FetchState,
  LoopFind,
  ReduxActionV2
} from '../../../types';

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
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}&limit=8`)}`
        : '/feed?limit=8',
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
  let finalPayload = { ...prevPostsState } as FetchState<PostStateProps[]>;
  const { data: _data, statusText } = _payload;
  const newData = _data ?? [];
  const pipeData = newData[0];
  const pipe = pipeData?.pipe;
  const homeUnmounted = /(home\s?)unmount(s|ed)/.test(statusText || '');
  const hadReachedEnd = /reached\send/.test(prevPostsState.statusText || ''); //attempt to reset Posts to [] if it had reached end in order to get fresh feeds
  const newPostCreated = /(new\s)?post\screated/.test(statusText || '');
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

    finalPayload = {
      ..._payload,
      data: resultantData,
      extra: _payload.extra ?? prevPostsState.extra
    };
  } else {
    let { value: actualPost, index: postIndex } = loopThru(
      finalPayload.data ?? [],
      ({ id }) =>
        id === pipeData.id ||
        id === pipeData.parent_id ||
        id === pipeData.parent?.id,
      { type: 'find', includeIndex: true }
    ) as LoopFind<PostStateProps>;
    const isReply = !!pipeData.parent_id;

    if (actualPost) {
      switch (pipe) {
        case POST_REACTION:
          if (isReply && actualPost.sec_type !== 'REPLY') {
            let {
              value: actualReply,
              index: replyIndex
            } = loopThru(
              actualPost.colleague_replies ?? [],
              (reply) => reply.id === pipeData.id,
              { type: 'find', includeIndex: true }
            ) as LoopFind<PostStateProps>;

            actualPost.colleague_replies[replyIndex] = {
              ...actualReply,
              ...pipeData
            };
          } else {
            actualPost = { ...actualPost, ...pipeData };
          }

          finalPayload.data![postIndex] = actualPost;
          break;
        case POST_REPLY:
          if (!actualPost.colleague_replies) {
            actualPost.colleague_replies = [];
          }

          actualPost.colleague_replies.push({
            ...pipeData,
            upvote_count: 0,
            downvote_count: 0
          });
          actualPost.numRepliesToShow = (actualPost.numRepliesToShow ?? 2) + 1;
          actualPost.reply_count = pipeData.parent!.reply_count!;
          finalPayload.data![postIndex] = actualPost;
          break;
      }
    }
  }

  return {
    type: SET_POSTS,
    payload: finalPayload
  };
};

export const profilePosts = () => {};
