import { SET_COLLEAGUE_REQUESTS } from '../constants';
import { ReduxAction, ColleagueRequestProps } from '../types';

export const colleagueRequests = (
  state: Array<ColleagueRequestProps> = [],
  action: ReduxAction
) => {
  if (action.type === SET_COLLEAGUE_REQUESTS) return [...action.payload];
  else return state;
};
