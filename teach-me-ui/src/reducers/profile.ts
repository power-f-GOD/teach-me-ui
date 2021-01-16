import { PROFILE_DATA } from '../constants/profile';
import { searchState } from '../constants/misc';
import { RequestState, SearchState, ReduxAction } from '../types';
import {
  FETCHED_DEEP_PROFILE_DATA,
  ADD_COLLEAGUE_STARTED,
  ADD_COLLEAGUE_RESOLVED,
  ADD_COLLEAGUE_REJECTED,
  FETCH_DEEP_PROFILE_STARTED,
  FETCH_DEEP_PROFILE_REJECTED,
  FETCH_DEEP_PROFILE_RESOLVED,
  REMOVE_COLLEAGUE_STARTED,
  REMOVE_COLLEAGUE_REJECTED,
  REMOVE_COLLEAGUE_RESOLVED,
  ACCEPT_COLLEAGUE_STARTED,
  ACCEPT_COLLEAGUE_REJECTED,
  ACCEPT_COLLEAGUE_RESOLVED,
  DECLINE_COLLEAGUE_STARTED,
  DECLINE_COLLEAGUE_REJECTED,
  DECLINE_COLLEAGUE_RESOLVED,
  UNCOLLEAGUE_STARTED,
  UNCOLLEAGUE_REJECTED,
  UNCOLLEAGUE_RESOLVED,
  FETCH_COLLEAGUES_STARTED,
  FETCH_COLLEAGUES_REJECTED,
  FETCH_COLLEAGUES_RESOLVED,
  FETCH_COLLEAGUE_REQUESTS_STARTED,
  FETCH_COLLEAGUE_REQUESTS_REJECTED,
  FETCH_COLLEAGUE_REQUESTS_RESOLVED,
  requestState,
  FETCHED_COLLEAGUES,
  FETCHED_COLLEAGUE_REQUESTS
} from '../constants';

export const profileData = (
  state: SearchState = { ...searchState, data: [{}] },
  action: ReduxAction
) => {
  if (action.type === PROFILE_DATA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const addColleagueStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case ADD_COLLEAGUE_REJECTED:
    case ADD_COLLEAGUE_RESOLVED:
    case ADD_COLLEAGUE_STARTED:
      return action.payload;
    default:
      return state;
  }
};
export const fetchDeepProfileStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case FETCH_DEEP_PROFILE_REJECTED:
    case FETCH_DEEP_PROFILE_RESOLVED:
    case FETCH_DEEP_PROFILE_STARTED:
      return action.payload;
    default:
      return state;
  }
};

export const deepProfileData = (state = null, action: ReduxAction) => {
  switch (action.type) {
    case FETCHED_DEEP_PROFILE_DATA:
      return action.payload;
    default:
      return state;
  }
};

export const removeColleagueStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case REMOVE_COLLEAGUE_REJECTED:
    case REMOVE_COLLEAGUE_RESOLVED:
    case REMOVE_COLLEAGUE_STARTED:
      return action.payload;
    default:
      return state;
  }
};
export const acceptColleagueStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case ACCEPT_COLLEAGUE_REJECTED:
    case ACCEPT_COLLEAGUE_RESOLVED:
    case ACCEPT_COLLEAGUE_STARTED:
      return action.payload;
    default:
      return state;
  }
};
export const declineColleagueStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case DECLINE_COLLEAGUE_REJECTED:
    case DECLINE_COLLEAGUE_RESOLVED:
    case DECLINE_COLLEAGUE_STARTED:
      return action.payload;
    default:
      return state;
  }
};
export const unColleagueStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case UNCOLLEAGUE_REJECTED:
    case UNCOLLEAGUE_RESOLVED:
    case UNCOLLEAGUE_STARTED:
      return action.payload;
    default:
      return state;
  }
};

export const fetchColleaguesStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case FETCH_COLLEAGUES_REJECTED:
    case FETCH_COLLEAGUES_RESOLVED:
    case FETCH_COLLEAGUES_STARTED:
      return action.payload;
    default:
      return state;
  }
};

export const colleagues = (state: Array<any> = [], action: ReduxAction) => {
  switch (action.type) {
    case FETCHED_COLLEAGUES:
      return action.payload;
    default:
      return state;
  }
};

export const fetchColleagueRequestsStatus = (
  state: RequestState = requestState,
  action: ReduxAction
) => {
  switch (action.type) {
    case FETCH_COLLEAGUE_REQUESTS_REJECTED:
    case FETCH_COLLEAGUE_REQUESTS_RESOLVED:
    case FETCH_COLLEAGUE_REQUESTS_STARTED:
      return action.payload;
    default:
      return state;
  }
};

export const colleagueRequests = (
  state: Array<any> = [],
  action: ReduxAction
) => {
  switch (action.type) {
    case FETCHED_COLLEAGUE_REQUESTS:
      return action.payload;
    default:
      return state;
  }
};
