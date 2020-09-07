import useApi from './base';
import { useApiResponse, UserData } from '../../constants';
import { getState } from '../../functions';

export const useGetTrends = (): useApiResponse<any> => {
  const token = (getState().userData as UserData).token;
  const [...r] = useApi<any>(
    {
      endpoint: `/hashtag/trending`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    },
    {},
    false
  );
  return r;
};
