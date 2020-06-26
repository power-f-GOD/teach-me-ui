import {
  ReduxAction,
  BasicInputState,
  // SearchState,
  // apiBaseURL as baseURL,
  // REQUEST_ADD_COLLEAGUE,
  ADD_COLLEAGUE
} from '../constants';

export const addColleague = (payload: BasicInputState): ReduxAction => {
  return {
    type: ADD_COLLEAGUE,
    payload
  };
};
