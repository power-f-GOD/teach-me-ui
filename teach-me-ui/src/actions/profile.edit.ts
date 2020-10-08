import axios from 'axios';
import { validateEmail } from '.';

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
  UPDATE_PROFILE_REQUEST,
  EditProfileState,
  ReduxAction,
  apiBaseURL as baseURL,
} from '../constants';

import { 
  logError, 
  callNetworkStatusCheckerFor, 
  getState, populateStateWithUserData 
} from '../functions';
import { validateUsername } from './validate';


export const updateProfileRequest = (data: any) => (
  dispatch: Function
): ReduxAction => {

  let {
    firstname,
    lastname,
    username,
    email,
    dob,
    department,
    level
  } = data;
  const [day, month, year] = dob.split('/');
  const date_of_birth = `${year}-${month}-${day}`;

  firstname = `${firstname[0].toUpperCase()}${firstname
    .slice(1)
    .toLowerCase()}`;
  lastname = `${lastname[0].toUpperCase()}${lastname.slice(1).toLowerCase()}`;
  username = username.toLowerCase();
  email = email.toLowerCase();

  const userData = getState().userData;

  dispatch(updateUserDataRequest({
    firstname,
    lastname,
    date_of_birth
  })(dispatch));

  if (level !== userData.level) {
    dispatch(updateAcademicDataRequest(
      level, 
      department
    )(dispatch));
  } else {
    dispatch(updateAcademicData({status: 'fulfilled'}))
  }

  if (username !== userData.username) {
    dispatch(updateUsernameRequest(username)(dispatch));
  } else {
    dispatch(updateUsername({status: 'fulfilled'}))
  }

  if (email !== userData.email) {
    dispatch(updateEmailRequest(email)(dispatch));
  } else {
    dispatch(updateEmail({status: 'fulfilled'}))
  }

  return {
    type: UPDATE_PROFILE_REQUEST
  };
};

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
      const displayName = `${data.firstname} ${data.lastname}`;
      const institution = `${data.institution.name}, ${data.institution.country}`
      populateStateWithUserData({
        ...data,
        displayName,
        institution
      }).then(() => {

        //set token for user session and subsequent authentication
        if (navigator.cookieEnabled) {
          localStorage.kanyimuta = JSON.stringify({
            ...data,
            displayName,
            dob: data.date_of_birth,
            institution,
            token
          });
        }
      });
      dispatch(
        getUserDetails({
          status: 'fulfilled',
          err: false,
          data
        })
      );
    } else {
      dispatch(
        getUserDetails({
          status: 'fulfilled',
          err: true,
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
          err: false,
          data
        })
      );
    } else {
      dispatch(
        updateAcademicData({
          status: 'fulfilled',
          err: true,
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
          err: false,
          data
        })
      );
    } else {
      dispatch(
        validateEmail({
          value: email,
          err: true,
          helperText: data.message
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
          err: false,
          data
        })
      );
    } else {
      dispatch(
        updatePassword({
          status: 'fulfilled',
          err: true,
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
          err: false,
          data
        })
      );
    } else {
      dispatch(
        validateUsername({
          value: username,
          err: true,
          helperText: data.message
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
          err: false,
          data
        })
      );
    } else {
      dispatch(
        updateUserData({
          status: 'fulfilled',
          err: true,
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