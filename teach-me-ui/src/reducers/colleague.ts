import {
  SET_COLLEAGUE_REQUESTS,
  ReduxAction,
  ColleagueRequestProps
} from '../constants';

export const colleagueRequests = (
  state: Array<ColleagueRequestProps> = [],
  action: ReduxAction
) => {
  if (action.type === SET_COLLEAGUE_REQUESTS) return [...action.payload];
  else return state;
};
