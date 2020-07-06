import axios from 'axios';

import {
  ReduxAction,
  SIGNUP_REQUEST,
  SIGNUP_USER,
  FORGOT_PASSWORD_PENDING,
  FORGOT_PASSWORD_COMPLETED,
  FORGOT_PASSWORD_REQUEST,
  SignupFormData,
  StatusPropsState,
  AUTHENTICATE_USER,
  SIGNIN_USER,
  SIGNIN_REQUEST,
  SigninFormData,
  AuthState,
  VERIFY_AUTH,
  SIGNOUT_REQUEST,
  SIGNOUT_USER,
  apiBaseURL as baseURL,
  UserData
} from '../constants';
import {
  validateEmail,
  validateUsername,
  validateSigninId,
  validateSigninPassword
} from './validate';
import {
  callNetworkStatusCheckerFor,
  populateStateWithUserData,
  logError
} from '../functions';
import { displaySnackbar } from './misc';

export const doForgotPassword = (email: string) => (
  dispatch: Function
): ReduxAction => {
  dispatch(forgotPasswordPending());
  axios({
    url: '/auth/pass/reset/request',
    baseURL,
    method: 'POST',
    data: {
      email
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).finally(() => {
    dispatch(forgotPasswordCompleted());
    dispatch(
      displaySnackbar({
        open: true,
        message: 'Password reset link has been sent!',
        severity: 'success',
        autoHide: true
      })
    );
  });
  return {
    type: FORGOT_PASSWORD_REQUEST
  };
};

export const doResetPassword = (
  password: string,
  token: string,
  callback: Function
) => (dispatch: Function): ReduxAction => {
  dispatch(forgotPasswordPending());
  axios({
    url: '/auth/pass/reset',
    baseURL,
    method: 'POST',
    data: {
      reset_token: token,
      password
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(({ data: _data }) => {
    dispatch(forgotPasswordCompleted());
    let message: string = '';
    if (/(token .+ decoded|reset .+ expired)/.test(_data.message)) {
      message = 'Password reset link has expired.';
    } else if (/changed/.test(_data.message)) {
      message = 'Password has been changed successfully';
    } else {
      message = _data.message;
    }
    dispatch(
      displaySnackbar({
        open: true,
        message,
        severity: _data.error ? 'error' : 'success',
        autoHide: true
      })
    );
    if (!_data.error) {
      callback();
    }
  });
  return {
    type: FORGOT_PASSWORD_REQUEST
  };
};

export const forgotPasswordPending = () => {
  return {
    type: FORGOT_PASSWORD_PENDING,
    payload: { status: 'pending' }
  };
};
export const forgotPasswordCompleted = () => {
  return {
    type: FORGOT_PASSWORD_COMPLETED,
    payload: { status: 'completed' }
  };
};

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signup({ status: 'pending', statusText: ' ' }));

  let {
    firstname,
    lastname,
    username,
    email,
    dob,
    password,
    institution,
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

  //check if user is online as lost network connection is not a failure state for Firebase db in order to give response to user
  callNetworkStatusCheckerFor({ name: 'signup', func: signup });

  axios({
    url: '/auth/register',
    baseURL,
    method: 'POST',
    data: {
      firstname,
      lastname,
      username,
      email,
      date_of_birth,
      password,
      institution_id: institution,
      department,
      level
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      const { data: _data } = response;
      const { error, message } = _data;

      if (!error) {
        const displayName = `${firstname} ${lastname}`;
        const dob = _data.date_of_birth;

        delete _data.error;
        delete _data.date_of_birth;

        const userData: UserData = { ..._data };

        populateStateWithUserData({
          ...userData,
          displayName,
          dob
        }).then(() => {
          dispatch(signup({ status: 'fulfilled' }));
          dispatch(auth({ status: 'settled', isAuthenticated: true }));
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Sign up success!',
              severity: 'success',
              autoHide: true
            })
          );

          //set token for user session and subsequent authentication
          if (navigator.cookieEnabled) {
            localStorage.kanyimuta = JSON.stringify({
              ...userData,
              displayName,
              dob
            });
          }
        });
      } else {
        switch (true) {
          case /username.+(taken|used?)/i.test(message):
            dispatch(
              validateUsername({
                value: username,
                err: true,
                helperText: 'The username is already taken. Kindly use another.'
              })
            );
            break;
          case /email.+(taken|used?)/i.test(message):
            dispatch(
              validateEmail({
                value: email,
                err: true,
                helperText: 'The email is already in use by another account.'
              })
            );
            break;
          default:
            dispatch(
              displaySnackbar({
                open: true,
                message,
                severity: 'error'
              })
            );
        }

        dispatch(
          signup({
            status: 'settled',
            err: error
          })
        );
      }
    })
    .catch(logError(signup));

  return {
    type: SIGNUP_REQUEST
  };
};

export function signup(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload
  };
}

export const requestSignin = (data: SigninFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signin({ status: 'pending' }));
  callNetworkStatusCheckerFor({ name: 'signin', func: signin });

  let { id, password } = data;
  let _id;

  if (/@/.test(id)) {
    _id = { email: id };
  } else {
    _id = { username: id };
  }

  axios({
    method: 'POST',
    url: '/auth/login',
    baseURL,
    data: {
      ..._id,
      password
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      const { data: _data } = response;
      const message = _data.message;
      const error = _data.error;

      if (!error) {
        const dob = _data.date_of_birth;
        const displayName = `${_data.firstname} ${_data.lastname}`;

        delete _data.error;
        delete _data.date_of_birth;

        const userData: UserData = { ..._data };

        populateStateWithUserData({
          ...userData,
          displayName,
          dob
        }).then(() => {
          dispatch(signin({ status: 'fulfilled' }));
          dispatch(auth({ status: 'settled', isAuthenticated: true }));
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Welcome back!',
              severity: 'success',
              autoHide: true
            })
          );

          //set token for user session and subsequent authentication
          if (navigator.cookieEnabled) {
            localStorage.kanyimuta = JSON.stringify({
              ...userData,
              displayName,
              dob
            });
          }
        });
      } else {
        switch (true) {
          case /details?|account/i.test(message):
            dispatch(
              validateSigninId({
                value: id,
                err: true,
                helperText: `${
                  /@/.test(id) ? 'Email' : 'Username'
                } does not match our records.`
              })
            );
            break;
          case /password.+(invalid)?/i.test(message):
            dispatch(
              validateSigninPassword({
                value: password,
                err: true,
                helperText: 'Password incorrect.'
              })
            );
            break;
          default:
            dispatch(
              displaySnackbar({
                open: true,
                message,
                severity: 'error'
              })
            );
        }

        dispatch(
          signin({
            status: 'settled',
            err: error
          })
        );
      }
    })
    .catch(logError(signin));

  return {
    type: SIGNIN_REQUEST
  };
};

export function signin(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNIN_USER,
    payload
  };
}

export const verifyAuth = () => (dispatch: Function): ReduxAction => {
  dispatch(auth({ status: 'pending' }));

  let userData = navigator.cookieEnabled
    ? JSON.parse(localStorage.kanyimuta ?? '{}')
    : null;

  if (userData?.token) {
    populateStateWithUserData({ ...userData }).then(() => {
      dispatch(auth({ status: 'fulfilled', isAuthenticated: true }));
      dispatch(signin({ status: 'fulfilled', err: false }));
    });
  } else {
    dispatch(auth({ status: 'fulfilled', isAuthenticated: false }));
    dispatch(signin({ status: 'fulfilled', err: true }));
  }

  return {
    type: VERIFY_AUTH
  };
};

export function auth(payload: AuthState): ReduxAction {
  return {
    type: AUTHENTICATE_USER,
    payload
  };
}

export const requestSignout = () => (dispatch: Function): ReduxAction => {
  setTimeout(() => dispatch(signout({ status: 'pending' })), 200);

  if (navigator.cookieEnabled) {
    localStorage.kanyimuta = JSON.stringify({
      ...JSON.parse(localStorage.kanyimuta ?? '{}'),
      id: null,
      token: null
    });
  }

  setTimeout(() => {
    dispatch(auth({ status: 'fulfilled', isAuthenticated: false }));
    dispatch(
      signout({
        status: 'fulfilled',
        err: false
      })
    );
    dispatch(
      displaySnackbar({
        open: true,
        message: "You're signed out.",
        severity: 'info',
        autoHide: true
      })
    );
  }, 300);

  return {
    type: SIGNOUT_REQUEST
  };
};

export function signout(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNOUT_USER,
    payload
  };
}
