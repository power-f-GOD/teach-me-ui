import { DEEP_PROFILE_DATA } from '../../../constants';
import { FetchState, ReduxActionV2, DeepProfileProps } from '../../../types';
import { checkNetworkStatusWhilstPend, http } from '../../../functions';

export const getDeepProfileData = (id: string) => (dispatch: Function) => {
  checkNetworkStatusWhilstPend({
    name: 'deepProfileData',
    func: deepProfileData
  });
  dispatch(deepProfileData({ status: 'pending' }));

  http
    .get<DeepProfileProps>(`/profile/${id}/deep`, true)
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
    .catch(deepProfileData);
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
