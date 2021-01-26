import {
  GET_PROFILE_DATA,
  PROFILE_DATA,
  PLACEHOLDER_BIO
} from '../../../constants';
import { ReduxActionV2, UserData, FetchState } from '../../../types';
import {
  checkNetworkStatusWhilstPend,
  logError,
  http
} from '../../../functions';

export const getProfileData = (username: string) => (
  dispatch: Function,
  getState: Function
): ReduxActionV2<any> => {
  const userData = getState().userData as UserData;

  if (userData.username === username) {
    // ensure to make profileData data always defined (if self)
    dispatch(
      profileData({
        status: 'fulfilled',
        err: false,
        data: getState().userData
      })
    );

    return {
      type: GET_PROFILE_DATA
    };
  }

  checkNetworkStatusWhilstPend({
    name: 'profileData',
    func: profileData
  });
  dispatch(
    profileData({ status: 'pending', data: {}, err: !navigator.onLine })
  );

  http
    .get<UserData>(`/profile/${username}`, false)
    .then(({ error, message, data }) => {
      const displayName = `${data?.first_name} ${data?.last_name}`;

      dispatch(
        profileData({
          status: error ? 'settled' : 'fulfilled',
          err: error ?? false,
          statusText: message ?? '',
          data: !error
            ? {
                ...data,
                displayName,
                dob: data?.date_of_birth,
                bio: data?.bio || PLACEHOLDER_BIO
              }
            : {}
        })
      );
    })
    .catch(logError(profileData));

  return {
    type: GET_PROFILE_DATA,
    newState: username
  };
};

export const profileData = (
  payload: FetchState<UserData | {}>
): ReduxActionV2<FetchState<UserData | {}>> => {
  return {
    type: PROFILE_DATA,
    payload
  };
};
