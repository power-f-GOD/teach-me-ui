import { FetchPostsState } from './interfaces';

export const CREATE_POST = 'CREATE_POST';
export const REACT_TO_POST = 'REACT_TO_POST';
export const FETCH_POST_STARTED = 'FETCH_POST_STARTED';
export const FETCH_POST_RESOLVED = 'FETCH_POST_RESOLVED';
export const FETCH_POST_REJECTED = 'FETCH_POST_REJECTED';
export const FETCHED_POSTS = 'FETCHED_POSTS';

export const fetchPostsState: FetchPostsState = {
  status: 'pending'
};
