import { searchState } from '../constants/misc';
import {
  RequestState,
  ReduxAction,
  ReduxActionV2,
  ColleagueAction,
  DeepProfileProps,
  FetchState,
  UserData
} from '../types';
import {
  DEEP_PROFILE_DATA,
  FETCH_COLLEAGUES_STARTED,
  FETCH_COLLEAGUES_REJECTED,
  FETCH_COLLEAGUES_RESOLVED,
  FETCH_COLLEAGUE_REQUESTS_STARTED,
  FETCH_COLLEAGUE_REQUESTS_REJECTED,
  FETCH_COLLEAGUE_REQUESTS_RESOLVED,
  requestState,
  FETCHED_COLLEAGUES,
  FETCHED_COLLEAGUE_REQUESTS,
  COLLEAGUE_ACTION,
  PROFILE_DATA,
  ADD_COLLEAGUE
} from '../constants';

export const colleagueAction = (
  state = {
    ...searchState,
    action: ADD_COLLEAGUE,
    data: {}
  } as ColleagueAction,
  action: ReduxActionV2<ColleagueAction>
) => {
  if (action.type === COLLEAGUE_ACTION) {
    return {
      ...state,
      ...action.payload,
      data: { ...state.data, ...action.payload?.data }
    };
  }

  return state;
};

export const profileData = (
  state = { ...searchState, data: {} } as FetchState<UserData>,
  action: ReduxActionV2<FetchState<UserData>>
) => {
  if (action.type === PROFILE_DATA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const deepProfileData = (
  state = {} as FetchState<DeepProfileProps>,
  action: ReduxActionV2<FetchState<DeepProfileProps>>
) => {
  switch (action.type) {
    case DEEP_PROFILE_DATA:
      return {
        ...state,
        ...action.payload,
        data: { ...state.data, ...action.payload?.data }
      };
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
