import {
  ReduxAction,
  SET_COLLEAGUE_REQUESTS,
  ColleagueRequestProps
} from '../constants';

export const setColleagueRequests = (
  payload: Array<ColleagueRequestProps> = []
): ReduxAction => {
  return { type: SET_COLLEAGUE_REQUESTS, payload };
};
