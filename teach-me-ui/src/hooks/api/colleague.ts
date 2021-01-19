import useApi from './base';
import { UseApiResponse, DeepProfileProps } from '../../types';

export const useAddColleague = (
  id: string,
  token: string
): UseApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/colleague/request',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { colleague: id }
  );
  return r;
};

export const useFetchDeepProfile = (
  id: string,
  token: string
): UseApiResponse<DeepProfileProps> => {
  const [...r]: UseApiResponse<DeepProfileProps> = useApi<any>({
    endpoint: `/profile/${id}/deep`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  return r;
};

export const useRemoveColleagueRequest = (
  request_id: string,
  token: string
): UseApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/colleague/request/remove',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: request_id }
  );
  return r;
};

export const useAcceptColleagueRequest = (
  request_id: string,
  token: string
): UseApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/colleague/request/accept',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: request_id }
  );
  return r;
};

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

export const useFetchColleagueRequests = (
  token: string
): UseApiResponse<any> => {
  const [...r]: UseApiResponse<any> = useApi<any>(
    {
      endpoint: '/colleague/requests',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    },
    undefined,
    false
  );
  return r;
};

export const useFetchColleagues = (token: string): UseApiResponse<any> => {
  const r: UseApiResponse<any> = useApi<any>(
    {
      endpoint: '/colleague/find',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    },
    undefined,
    false
  );
  return r;
};
