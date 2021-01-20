import { MakePostState, PostStateProps } from '../types';

// @Prince, work to ensure these next three lines are removed; Check where they are being referenced then modify their implementations
export const MAKE_REPOST_STARTED = 'MAKE_REPOST_STARTED';
export const MAKE_REPOST_RESOLVED = 'MAKE_REPOST_RESOLVED';
export const MAKE_REPOST_REJECTED = 'MAKE_REPOST_REJECTED';

export const REPLY_TO_POST = 'REPLY_TO_POST';
export const SUBMIT_POST = 'SUBMIT_POST';

export const GET_POSTS = 'GET_POSTS';
export const SET_POSTS = 'SET_POSTS';

export const GET_RECOMMENDATIONS = 'GET_RECOMMENDATIONS';
export const SET_RECOMMENDATIONS = 'SET_RECOMMENDATIONS';

export const GET_TRENDS = 'GET_TRENDS';
export const SET_TRENDS = 'SET_TRENDS';

export const POST_REACTION = 'POST_REACTION';
export const POST_REPLY = 'POST_REPLY';

export const UPVOTE = 'UPVOTE';
export const NEUTRAL = 'NEUTRAL';
export const DOWNVOTE = 'DOWNVOTE';

// To self - Keep this yet, don't touch/remove; Use/test when back-end is up and running again to avoid breaking things
export const POSTS_EVENT__FEEDS_REACHED_END = 'POSTS_EVENT__FEEDS_REACHED_END';
export const POSTS_EVENT__FEEDS_UNMOUNTED = 'POSTS_EVENT__FEEDS_UNMOUNTED';
export const POSTS_EVENT__FEEDS_IS_RECYCLING =
  'POSTS_EVENT__FEEDS_IS_RECYCLING';
export const POSTS_EVENT__FEEDS_IS_FETCHING = 'POSTS_EVENT__FEEDS_IS_FETCHING';

export const fetchState = {
  status: 'settled',
  err: false,
  statusText: '',
  data: []
};

export const makePostState: MakePostState = {
  status: 'settled'
};

export const postState: PostStateProps = {
  downvote_count: 0,
  reactions: [],
  reply_count: 0,
  repost_count: 0,
  reposted: false,
  upvote_count: 0,
  downvotes: 0,
  id: '',
  media: [],
  date: Date.now(),
  reaction: NEUTRAL,
  colleague_replies: [],
  colleague_reposts: [],
  sender: {} as any,
  text: '',
  upvotes: [],
  type: 'post',
  numRepliesToShow: 2
};