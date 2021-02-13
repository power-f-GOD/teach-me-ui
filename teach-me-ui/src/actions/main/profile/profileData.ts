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
import { setUserData } from '../..';

export const getProfileData = (username: string, forSelf?: boolean) => (
  dispatch: Function
): ReduxActionV2<any> => {
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

      // update state and localStorage
      if (forSelf) {
        setUserData({
          ...data,
          displayName,
          dob: data?.date_of_birth,
          bio: data?.bio || PLACEHOLDER_BIO
        });

        if (navigator.cookieEnabled) {
          const prevStorage = JSON.parse(localStorage.kanyimuta);

          localStorage.kanyimuta = JSON.stringify({
            ...prevStorage,
            ...data,
            displayName,
            dob: data.date_of_birth,
            token: prevStorage.token
          });
        }
      }
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
