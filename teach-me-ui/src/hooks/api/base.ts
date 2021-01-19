import { apiBaseURL as baseURL } from '../../constants';
import { ApiProps, UseApiResponse } from '../../types';
import { dispatch } from '../../functions';
import { displaySnackbar } from '../../actions';
import { useState, useCallback, useEffect } from 'react';
import Axios from 'axios';

const AxiosManager = Axios.CancelToken.source();

export default function useApi<T>(
  props: ApiProps,
  body: T = {} as T,
  lazy: boolean = true,
  runWithResult: Function = () => {}
): UseApiResponse<any> {
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
        // console.log(res.data);
        setData(res.data);
        throw new Error(res.data.message);
      }
      runWithResult(res.data);
      setData(res.data);
      return res.data;
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
    // eslint-disable-next-line
  }, [props, body]);
  useEffect(() => {
    if (!lazy) {
      callback();
    }
    // return AxiosManager.cancel;
    // eslint-disable-next-line
  }, [lazy]);
  return [callback, data, isLoading];
}
