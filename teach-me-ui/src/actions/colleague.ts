import { SET_COLLEAGUE_REQUESTS } from '../constants';
import { ReduxAction, ColleagueRequestProps } from '../types';

export const setColleagueRequests = (
  payload: Array<ColleagueRequestProps> = []
): ReduxAction => {
  return { type: SET_COLLEAGUE_REQUESTS, payload };
};
