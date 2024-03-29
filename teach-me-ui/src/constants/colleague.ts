import { RequestState } from '../types';

export const SET_COLLEAGUE_REQUESTS = 'SET_COLLEAGUE_REQUESTS';
export const DEEP_PROFILE_DATA = 'FETCHED_DEEP_PROFILE_DATA';

export const FETCH_COLLEAGUE_REQUESTS_STARTED =
  'FETCH_COLLEAGUE_REQUESTS_STARTED';
export const FETCH_COLLEAGUE_REQUESTS_REJECTED =
  'FETCH_COLLEAGUE_REQUESTS_REJECTED';
export const FETCH_COLLEAGUE_REQUESTS_RESOLVED =
  'FETCH_COLLEAGUE_REQUESTS_RESOLVED';
export const FETCHED_COLLEAGUE_REQUESTS = 'FETCHED_COLLEAGUE_REQUESTS';

export const IS_COLLEAGUE = 'IS_COLLEAGUE';
export const PENDING_REQUEST = 'PENDING_REQUEST';
export const AWAITING_REQUEST_ACTION = 'AWAITING_REQUEST_ACTION';
export const NOT_COLLEAGUES = 'NOT_COLLEAGUES';

export const ADD_COLLEAGUE = 'ADD_COLLEAGUE';
export const CANCEL_REQUEST = 'CANCEL_REQUEST';
export const ACCEPT_REQUEST = 'ACCEPT_REQUEST';
export const DECLINE_REQUEST = 'DECLINE_REQUEST';
export const UNCOLLEAGUE = 'UNCOLLEAGUE';

export const COLLEAGUE_ACTION = 'COLLEAGUE_ACTION';
export const REQUEST_COLLEAGUE_ACTION = 'REQUEST_COLLEAGUE_ACTION';

export const GET_COLLEAGUES = 'GET_COLLEAGUES';
export const SET_COLLEAGUES = 'SET_COLLEAGUES';

export const requestState: RequestState = {
  status: 'resolved'
};
