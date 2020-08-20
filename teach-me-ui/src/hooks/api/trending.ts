import useApi from './base';
import { useApiResponse } from '../../constants';

const { cookieEnabled } = navigator;

let token = '';
if (cookieEnabled) {
  token = JSON.parse(localStorage?.kanyimuta ?? '{}')?.token ?? null;
}

export const useGetTrends = (): useApiResponse<any> => {
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
