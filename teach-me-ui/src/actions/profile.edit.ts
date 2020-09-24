import axios from 'axios';

import { 
  GET_USER_DETAILS,
  GET_USER_DETAILS_REQUEST,
  UPDATE_PASSWORD,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_USERNAME,
  UPDATE_USERNAME_REQUEST,
  UPDATE_EMAIL,
  UPDATE_EMAIL_REQUEST,
  UPDATE_USER_DATA,
  UPDATE_USER_DATA_REQUEST,
  UPDATE_ACADEMIC_DATA,
  UPDATE_ACADEMIC_DATA_REQUEST,
  EditProfileState,
  ReduxAction,
  apiBaseURL as baseURL,
} from '../constants';

import { 
  logError, 
  callNetworkStatusCheckerFor, 
  getState 
} from '../functions';


export const getUserDetails = (payload: EditProfileState) => {
  return {
    type: GET_USER_DETAILS,
    payload
  };
};

export const updateAcademicData = (payload: EditProfileState) => {
  return {
    type: UPDATE_ACADEMIC_DATA,
    payload
  };
};

export const updateEmail = (payload: EditProfileState) => {
  return {
    type: UPDATE_EMAIL,
    payload
  };
};

export const updatePassword = (payload: EditProfileState) => {
  return {
    type: UPDATE_PASSWORD,
    payload
  };
};

export const updateUsername = (payload: EditProfileState) => {
  return {
    type: UPDATE_USERNAME,
    payload
  };
};

export const updateUserData = (payload: EditProfileState) => {
  return {
    type: UPDATE_USER_DATA,
    payload
  };
};

export const getUserDetailsRequest = () => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'getUserDetails',
    func: getUserDetails
  });
  dispatch(getUserDetails({ status: 'pending' }));
  

  axios({
    url: '/account',
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    }
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        getUserDetails({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        getUserDetails({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(getUserDetails));
  return {
    type: GET_USER_DETAILS_REQUEST,
  };
}; 

export const updateAcademicDataRequest = (level: number, department: string) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'updateAcademicData',
    func: updateAcademicData
  });
  dispatch(updateAcademicData({ status: 'pending' }));
  

  axios({
    url: '/account/enrollment/update',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      level,
      department
    }
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        updateAcademicData({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        updateAcademicData({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(updateAcademicData));
  return {
    type: UPDATE_ACADEMIC_DATA_REQUEST,
  };
}; 

export const updateEmailRequest = (email: string) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'updateEmail',
    func: updateEmail
  });
  dispatch(updateEmail({ status: 'pending' }));
  

  axios({
    url: 'account/email/update',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      email
    }
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        updateEmail({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        updateEmail({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(updateEmail));
  return {
    type: UPDATE_EMAIL_REQUEST,
  };
}; 

export const updatePasswordRequest = (current_password: string, new_password: string) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'updatePassword',
    func: updatePassword
  });
  dispatch(updatePassword({ status: 'pending' }));
  

  axios({
    url: 'account/password/update',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      current_password,
      new_password
    }
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        updatePassword({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        updatePassword({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(updatePassword));
  return {
    type: UPDATE_PASSWORD_REQUEST,
  };
}; 

export const updateUsernameRequest = (username: string) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'updateUsername',
    func: updateUsername
  });
  dispatch(updateUsername({ status: 'pending' }));
  

  axios({
    url: 'account/username/update',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      username
    }
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        updateUsername({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        updateUsername({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(updateUsername));
  return {
    type: UPDATE_USERNAME_REQUEST,
  };
}; 

export const updateUserDataRequest = (data: Object) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'updateUserData',
    func: updateUserData
  });
  dispatch(updateUserData({ status: 'pending' }));
  

  axios({
    url: '/account/update',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data
  })
  .then(({ data }: any) => {
    if (!data.error) {
      dispatch(
        updateUserData({
          status: 'fulfilled',
          err: true,
          data
        })
      );
    } else {
      dispatch(
        updateUserData({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    }
  })
  .catch(logError(updateUserData));
  return {
    type: UPDATE_USER_DATA_REQUEST,
  };
}; 