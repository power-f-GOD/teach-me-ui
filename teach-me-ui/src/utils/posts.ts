import { POST_REACTION, POST_REPLY, POSTS_ANCHOR__PROFILE } from '../constants';
import { PostStateProps, FetchState, LoopFind } from '../types';
import { getState, loopThru } from '../functions';

export const updatePost = (
  _payload: FetchState<PostStateProps[], number>,
  anchor?: 'FEEDS' | 'PROFILE'
): FetchState<PostStateProps[], number> => {
  let { posts, profilePosts } = getState() as {
    posts: FetchState<PostStateProps[]>;
    profilePosts: FetchState<PostStateProps[]>;
  };
  const anchorIsProfile = anchor === POSTS_ANCHOR__PROFILE;
  const prevPostsState = !anchorIsProfile ? posts : profilePosts;
  let finalPayload = { ...prevPostsState } as FetchState<PostStateProps[]>;
  const { data: _data, statusText } = _payload;
  const newData = _data ?? [];
  const pipeData = newData[0];
  const pipe = pipeData?.pipe;
  const feedsUnmounts = /(feeds?\s?)unmount(s|ed)/.test(statusText || '');
  const hadReachedEnd = /reached\send/.test(prevPostsState.statusText || ''); //attempt to reset Posts to [] if it had reached end in order to get fresh feeds
  const newPostCreated = /(new\s)?post\screated/.test(statusText || '');
  const updateFromSocket = !!pipe;
  let resultantData = [] as PostStateProps[];

  if (anchorIsProfile) {
    resultantData = feedsUnmounts ? [] : [...prevPostsState.data];
  } else {
    resultantData = feedsUnmounts
      ? hadReachedEnd
        ? []
        : [...prevPostsState.data?.slice(-3)]
      : [...prevPostsState.data];
  }

  if (!updateFromSocket) {
    if (!feedsUnmounts) {
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
    const isForReply = !!pipeData.parent_id;
    // console.log(actualPost, pipeData)

    if (actualPost) {
      switch (pipe) {
        case POST_REACTION:
          if (isForReply && actualPost.sec_type !== 'REPLY') {
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

  return finalPayload;
};
