import { DEEP_PROFILE_DATA } from '../../../constants';
import { FetchState, ReduxActionV2, DeepProfileProps } from '../../../types';
import {
  checkNetworkStatusWhilstPend,
  http,
  logError
} from '../../../functions';

export const getDeepProfileData = (username: string) => (
  dispatch: Function
) => {
  checkNetworkStatusWhilstPend({
    name: 'deepProfileData',
    func: deepProfileData
  });
  dispatch(
    deepProfileData({
      status: 'pending',
      data: { username },
      err: !navigator.onLine
    })
  );

  http
    .get<DeepProfileProps>(`/profile/${username}/deep`, true)
    .then(({ error, message, data }) => {
      const payload = { data };

      if (error) delete payload.data;

      dispatch(
        deepProfileData({
          err: error ?? false,
          status: error ? 'settled' : 'fulfilled',
          statusText: message ?? '',
          ...payload
        })
      );
    })
    .catch(logError(deepProfileData));
};

export const deepProfileData = (
  payload: FetchState<DeepProfileProps>
): ReduxActionV2<FetchState<DeepProfileProps>> => {
  return {
    type: DEEP_PROFILE_DATA,
    payload
  };
};

export {};
