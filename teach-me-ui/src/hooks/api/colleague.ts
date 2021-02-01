import useApi from './base';
import { UseApiResponse } from '../../types';

export const useDeclineColleagueRequest = (
  request_id: string,
  token: string
): UseApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/colleague/request/decline',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: request_id }
  );
  return r;
};

export const useUnColleague = (
  id: string,
  token: string
): UseApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/uncolleague',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { colleague: id }
  );
  return r;
};
