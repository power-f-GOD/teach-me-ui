import { FetchState, MakePostState, PostStateProps } from '../types';

export const REPLY_TO_POST = 'REPLY_TO_POST';
export const SUBMIT_POST = 'SUBMIT_POST';

export const FETCH_POST = 'FETCH_POST';
export const FETCH_REPLIES = 'FETCH_REPLIES';

export const GET_POSTS = 'GET_POSTS';
export const SET_POSTS = 'SET_POSTS';
export const GET_FEEDS_POSTS = 'GET_FEEDS_POSTS';
export const SET_FEEDS_POSTS = 'SET_FEEDS_POSTS';
export const GET_PROFILE_POSTS = 'GET_PROFILE_POSTS';
export const SET_PROFILE_POSTS = 'SET_PROFILE_POSTS';

export const GET_RECOMMENDATIONS = 'GET_RECOMMENDATIONS';
export const SET_RECOMMENDATIONS = 'SET_RECOMMENDATIONS';

export const GET_TRENDS = 'GET_TRENDS';
export const SET_TRENDS = 'SET_TRENDS';

export const POST_REACTION = 'POST_REACTION';
export const POST_REPLY = 'POST_REPLY';
export const POST_REPOST = 'POST_REPOST';

export const POST_INTERACTION = 'POST_INTERACTION';
export const POST_INTERACTION__SEEN = 'SEEN';

export const POST_REACTION__LIKE = 'UPVOTE';
export const POST_REACTION__NEUTRAL = 'NEUTRAL';
export const POST_REACTION__DOWNVOTE = 'DOWNVOTE';

export const POSTS_ANCHOR__HOME = 'HOME';
export const POSTS_ANCHOR__PROFILE = 'PROFILE';

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

export const makeRepostState: FetchState<any> = {
  status: 'settled',
  err: false
};

export const fetchRepliesState: FetchState<Array<Object>> = {
  status: 'settled',
  err: false,
  data: []
}

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
  reaction: POST_REACTION__NEUTRAL,
  colleague_replies: [],
  colleague_reposts: [],
  sender: {} as any,
  text: '',
  upvotes: [],
  type: 'post',
  numRepliesToShow: 2,
  replies:[]
};

export const fetchPostState: FetchState<PostStateProps> = {
  status: 'settled',
  err: false,
  data: postState
}