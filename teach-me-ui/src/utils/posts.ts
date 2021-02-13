import {
  POST_REACTION,
  POST_REPLY,
  POSTS_ANCHOR__PROFILE,
  POST_REACTION__NEUTRAL
} from '../constants';
import { PostStateProps, FetchState, LoopFind } from '../types';
import { getState, loopThru } from '../functions';

export const updatePosts = (
  _payload: FetchState<PostStateProps[], number>,
  anchor?: 'FEEDS' | 'PROFILE'
): FetchState<PostStateProps[], number> => {
  let { posts, profilePosts } = getState() as {
    posts: FetchState<PostStateProps[]>;
    profilePosts: FetchState<PostStateProps[]>;
    fetchPost: FetchState<PostStateProps>;
  };
  const anchorIsProfile = anchor === POSTS_ANCHOR__PROFILE;
  const prevPostsState = !anchorIsProfile ? posts : profilePosts;
  let finalPayload = { ...prevPostsState } as FetchState<PostStateProps[]>;
  const { data: _data, statusText } = _payload;
  const newData = _data ?? [];
  const pipeData = newData[0];
  const feedsUnmounted = /(feeds?\s?)unmount(s|ed)/.test(statusText || '');
  const refreshingFeeds = /refreshing\s(feeds?)?/.test(statusText || '');
  const hadReachedEnd = /reached\send/.test(prevPostsState.statusText || ''); //attempt to reset Posts to [] if it had reached end in order to get fresh feeds
  const newPostCreated = /(new\s)?post\screated/.test(statusText || '');
  const updateFromSocket = !!pipeData?.pipe;
  let resultantData = [] as PostStateProps[];

  if (anchorIsProfile) {
    resultantData = feedsUnmounted ? [] : [...prevPostsState.data];
  } else {
    resultantData = feedsUnmounted
      ? hadReachedEnd
        ? []
        : [...prevPostsState.data?.slice(-3)]
      : [...prevPostsState.data];
  }

  if (!updateFromSocket) {
    if (!feedsUnmounted) {
      resultantData[newPostCreated ? 'unshift' : 'push'](...newData);
    }

    finalPayload = {
      ..._payload,
      data: refreshingFeeds ? [] : resultantData,
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

    if (actualPost) {
      finalPayload.data![postIndex] = updatePost(actualPost, {
        pipe: pipeData.pipe,
        data: pipeData
      });
    }
  }

  return finalPayload;
};

export const updatePost = (
  _post: PostStateProps,
  { pipe, data }: { pipe: PostStateProps['pipe']; data: PostStateProps }
) => {
  const updateIsForReply = !!data.parent_id;
  let updatedPost = { ..._post };

  switch (pipe) {
    case POST_REACTION:
      if (updateIsForReply && updatedPost.sec_type !== 'REPLY') {
        let {
          value: actualReply,
          index: replyIndex
        } = loopThru(
          updatedPost.colleague_replies ?? [],
          (reply) => reply.id === data.id,
          { type: 'find', includeIndex: true }
        ) as LoopFind<PostStateProps>;

        updatedPost.colleague_replies[replyIndex] = {
          ...actualReply,
          ...data
        };
      } else {
        updatedPost = { ...updatedPost, ...data };
      }

      break;
    case POST_REPLY:
      if (!updatedPost.colleague_replies) {
        updatedPost.colleague_replies = [];
      }

      updatedPost.colleague_replies.push({
        ...data,
        upvote_count: 0,
        downvote_count: 0,
        reaction: POST_REACTION__NEUTRAL
      });
      updatedPost.numRepliesToShow = (updatedPost.numRepliesToShow ?? 2) + 1;
      updatedPost.reply_count = data.parent!.reply_count!;
      break;
  }

  return updatedPost;
};
