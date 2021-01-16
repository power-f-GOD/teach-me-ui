import { SET_TRENDS, GET_TRENDS } from '../../../constants';
import { FetchState, HashTag } from '../../../types';

import { checkNetworkStatusWhilstPend, http } from '../../../functions';

export const getTrends = () => (dispatch: Function) => {
  checkNetworkStatusWhilstPend({
    name: 'trends',
    func: trends
  });

  http
    .get<HashTag[]>('/hashtag/trending', true)
    .then(({ error, message, data }) => {
      if (error) {
        dispatch(trends({ status: 'settled', statusText: message, err: true }));
      } else {
        dispatch(
          trends({
            status: 'fulfilled',
            statusText: message,
            err: false,
            data
          })
        );
      }
    })
    .catch(trends);

  return {
    type: GET_TRENDS
  };
};

export const trends = (payload: FetchState<HashTag[]>) => {
  return {
    type: SET_TRENDS,
    payload
  };
};
