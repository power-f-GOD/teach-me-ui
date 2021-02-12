import { 
  displaySnackbar,
  fetchReplies,
  fetchPost
} from '../actions';

import Axios from 'axios';

import {
  dispatch,
  getState
} from '../utils';

import {
  apiBaseURL as baseURL,
  POST_REACTION,
  POST_REPLY,
  POST_REPOST
} from '../constants';

import {
  PostStateProps,
  UserData
} from '../types';

export const fetchMentionsFn = (value: string) => {
  const token = (getState().userData as UserData).token;
  return Axios({
    url: `/colleague/find?keyword=${value}`,
    method: 'GET',
    baseURL,
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      return response.data.data.colleagues;
    })
    .catch((e) => {
      dispatch(
        displaySnackbar({
          autoHide: true,
          open: true,
          message: e.message,
          severity: 'error'
        })
      );
    });
};

export const updatePostPage = (data: PostStateProps) => {
  const { fetchPost: fetchPostProps, userData} = getState();
  switch (data.pipe) {
    case POST_REPLY:
      console.log(data);
      
      const postToUpdateReply = {...fetchPostProps.data, reply_count: data.parent!.reply_count, replies: [...fetchPostProps.data.replies, { ...data, upvote_count: 0, downvote_count: 0}]};
      dispatch(fetchPost({ data: postToUpdateReply }));
      userData.id === data.sender.id && window.scrollTo(0,document.body.scrollHeight);
      break;
    case POST_REACTION:
      if (data.parent_id) {
        let replyInPost: boolean = true;
        let finalReplies = [];
        let finalRepliesFromPost = [];
        const { fetchReplies:repliesInState } = getState();
        let tempRepliesInState : Array<PostStateProps> = Array.from(repliesInState.data);
        for (let reply of tempRepliesInState) {
          if (reply.id === data.id) {
            replyInPost = false;
            reply.reaction = data.reaction;
            reply.upvote_count = data.upvote_count;
            reply.downvote_count = data.downvote_count;
          }
          finalReplies.push(reply);
        }

        for (let reply of fetchPostProps.data.replies) {
          if (reply.id === data.id) {
            replyInPost = true;
            reply.reaction = data.reaction;
            reply.upvote_count = data.upvote_count;
            reply.downvote_count = data.downvote_count;
          }
          finalRepliesFromPost.push(reply);
        }
        replyInPost ? dispatch(fetchPost({data: { ...fetchPostProps.data, replies: finalRepliesFromPost}})) : dispatch(fetchReplies({data: finalReplies}));
      } else {
        const { fetchPost:postsInState } = getState();
        let tempPost = {}
        if (postsInState.data.id === data.id) {
          tempPost = { ...postsInState.data, ...data, pipe: undefined}
        }
        dispatch(fetchPost({ data: tempPost }))
      }
      break;
    case POST_REPOST:
      const postToUpdateRepost = {...fetchPostProps.data, repost_count: data.parent!.repost_count};
      dispatch(fetchPost({ data: postToUpdateRepost }));
      break
    default:
      break;
  }
}