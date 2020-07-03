import { ApiProps, apiBaseURL as baseURL, useApiResponse } from '../constants';
import { useState, useCallback } from 'react';
import Axios from 'axios';

export default function useApi<T>(
  props: ApiProps,
  body: T = {} as T
): useApiResponse<any> {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const callback = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await Axios({
        ...props,
        baseURL,
        url: props.endpoint,
        data: body
      }).catch((e) => {
        throw new Error(e.response?.data);
      });
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [props, body]);
  return [callback, data, isLoading];
}
