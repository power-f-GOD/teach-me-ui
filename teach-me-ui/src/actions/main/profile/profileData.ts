import { GET_PROFILE_DATA, PROFILE_DATA, PLACEHOLDER_BIO } from '../../../constants';
import { ReduxAction, UserData, FetchState } from '../../../types';
import {
  checkNetworkStatusWhilstPend,
  logError,
  http
} from '../../../functions';

export const getProfileData = (userId: string) => (
  dispatch: Function
): ReduxAction => {
  checkNetworkStatusWhilstPend({
    name: 'profileData',
    func: profileData
  });
  dispatch(profileData({ status: 'pending' }));

  http
    .get<UserData>(`/profile/${userId}`, false)
    .then(({ error, message, data }) => {
      const displayName = `${data.first_name} ${data.last_name}`;

      dispatch(
        profileData({
          status: error ? 'settled' : 'fulfilled',
          err: error ?? false,
          statusText: message ?? '',
          data: !error
            ? {
                ...data,
                displayName,
                dob: data.date_of_birth,
                bio: data.bio || PLACEHOLDER_BIO
              }
            : {}
        })
      );
    })
    .catch(logError(profileData));

  return {
    type: GET_PROFILE_DATA,
    newState: userId
  };
};

export const profileData = (
  payload: FetchState<UserData | {}>
): ReduxAction => {
  return {
    type: PROFILE_DATA,
    payload
  };
};
