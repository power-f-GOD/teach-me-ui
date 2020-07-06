import axios from 'axios';

import {
  ReduxAction,
  BasicInputState,
  SearchState,
  UserData,
  // REQUEST_ADD_COLLEAGUE,
  GET_PROFILE_DATA,
  PROFILE_DATA,
  ADD_COLLEAGUE,
  apiBaseURL as baseURL
} from '../constants';
import { callNetworkStatusCheckerFor, logError } from '../functions';

export const addColleague = (payload: BasicInputState): ReduxAction => {
  return {
    type: ADD_COLLEAGUE,
    payload
  };
};

export const profileData = (payload: SearchState): ReduxAction => {
  return {
    type: PROFILE_DATA,
    payload
  };
};

export const getProfileData = (userId: string) => (
  dispatch: Function
): ReduxAction => {
  callNetworkStatusCheckerFor({
    name: 'profileData',
    func: profileData
  });
  dispatch(profileData({ status: 'pending' }));

  axios({
    url: `/profile/${userId}`,
    baseURL,
    method: 'GET'
  })
    .then(({ data }: any) => {
      const _data = { ...data };
      const { error } = data;

      delete _data.error;

      if (!error) {
        const dob = _data.date_of_birth;
        const displayName = `${_data.firstname} ${_data.lastname}`;

        delete _data.error;
        delete _data.date_of_birth;

        const userData: UserData = { ..._data, displayName, dob };

        dispatch(
          profileData({
            status: 'fulfilled',
            err: false,
            data: [userData]
          })
        );
      } else {
        dispatch(
          profileData({
            status: 'fulfilled',
            err: true,
            data: [{}]
          })
        );
      }
    })
    .catch(logError(profileData));

  return {
    type: GET_PROFILE_DATA,
    newState: userId
  };
};
