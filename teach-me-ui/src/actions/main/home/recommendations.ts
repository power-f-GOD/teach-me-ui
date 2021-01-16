import { SET_RECOMMENDATIONS, GET_RECOMMENDATIONS } from '../../../constants';
import { UserData, FetchState } from '../../../types';

import { checkNetworkStatusWhilstPend, http } from '../../../functions';

export const getRecommendations = () => (dispatch: Function) => {
  checkNetworkStatusWhilstPend({
    name: 'recommendations',
    func: recommendations
  });

  http
    .get<UserData[]>('/people/recommendations', true)
    .then(({ error, message, data }) => {
      if (error) {
        dispatch(
          recommendations({ status: 'settled', statusText: message, err: true })
        );
      } else {
        dispatch(
          recommendations({
            status: 'fulfilled',
            statusText: message,
            err: false,
            data
          })
        );
      }
    })
    .catch(recommendations);

  return {
    type: GET_RECOMMENDATIONS
  };
};

export const recommendations = (payload: FetchState<UserData[]>) => {
  return {
    type: SET_RECOMMENDATIONS,
    payload
  };
};
