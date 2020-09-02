import { FetchPostsState, MakeRepostState } from './interfaces';

export const CREATE_POST = 'CREATE_POST';
export const REACT_TO_POST = 'REACT_TO_POST';
export const FETCH_POST_STARTED = 'FETCH_POST_STARTED';
export const FETCH_POST_RESOLVED = 'FETCH_POST_RESOLVED';
export const FETCH_POST_REJECTED = 'FETCH_POST_REJECTED';
export const FETCH_A_POST_STARTED = 'FETCH_A_POST_STARTED';
export const FETCH_A_POST_RESOLVED = 'FETCH_A_POST_RESOLVED';
export const FETCH_A_POST_REJECTED = 'FETCH_A_POST_REJECTED';
export const MAKE_REPOST_STARTED = 'MAKE_REPOST_STARTED';
export const MAKE_REPOST_RESOLVED = 'MAKE_REPOST_RESOLVED';
export const MAKE_REPOST_REJECTED = 'MAKE_REPOST_REJECTED';
export const FETCHED_POSTS = 'FETCHED_POSTS';
export const FETCHED_MORE_POSTS = 'FETCHED_MORE_POSTS';
export const FETCHED_POST = 'FETCHED_POST';
export const UPDATE_POST = 'UPDATE_POST';
export const UPDATE_REPOST = 'UPDATE_REPOST';
export const REPLY_TO_POST = 'REPLY_TO_POST';
export const SEND_REPLY_TO_SERVER = 'SEND_REPLY_TO_SERVER';

export const fetchPostsState: FetchPostsState = {
  status: 'pending'
};

export const makeRepostState: MakeRepostState = {
  status: 'resolved'
};
