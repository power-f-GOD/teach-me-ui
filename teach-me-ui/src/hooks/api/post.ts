import useApi from './base';
import { UserData } from '../../constants';

import { getState } from '../../functions';

export const useGetRecommendations = () => {
  const token = (getState().userData as UserData).token;
  const r = useApi<any>(
    {
      endpoint: `/people/recommendations`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    },
    {},
    false
  );
  return r;
};
