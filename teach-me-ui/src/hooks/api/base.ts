import {
  ApiProps,
  apiBaseURL as baseURL,
  useApiResponse
} from '../../constants';
import { dispatch } from '../../functions';
import { displaySnackbar } from '../../actions';
import { useState, useCallback, useEffect } from 'react';
import Axios from 'axios';

const AxiosManager = Axios.CancelToken.source();

export default function useApi<T>(
  props: ApiProps,
  body: T = {} as T,
  lazy: boolean = true
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
        cancelToken: AxiosManager.token,
        data: body
      }).catch((e) => {
        if (!Axios.isCancel(e)) {
          throw new Error(e);
        }
        throw new Error(e.response?.data);
      });
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      setData(res.data);
    } catch (e) {
      if (!Axios.isCancel(e)) {
        dispatch(
          displaySnackbar({
            open: true,
            message: e.message,
            severity: 'error',
            autoHide: true
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [props, body]);
  useEffect(() => {
    if (!lazy) {
      callback();
    }
    // return AxiosManager.cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy]);
  return [callback, data, isLoading];
}