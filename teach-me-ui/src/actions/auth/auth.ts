import {
  AUTHENTICATE_USER,
  VERIFY_AUTH,
  SIGNOUT_REQUEST,
  SIGNOUT_USER,
  PLACEHOLDER_BIO
} from '../../constants';
import { ReduxAction, StatusPropsState, AuthState } from '../../types';
import { populateStateWithUserData, delay, http } from '../../functions';
import { displaySnackbar } from '../misc';
import { signin } from './signin';

export const verifyAuth = () => (dispatch: Function): ReduxAction => {
  dispatch(auth({ status: 'pending' }));

  let userData = navigator.cookieEnabled
    ? JSON.parse(localStorage.kanyimuta ?? '{}')
    : null;

  if (userData?.token) {
    populateStateWithUserData({
      ...userData,
      bio: userData.bio || PLACEHOLDER_BIO
    }).then(() => {
      http.token = userData.token!;
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
  dispatch(signout({ status: 'pending' }));

  if (navigator.cookieEnabled) {
    const username = JSON.parse(localStorage.kanyimuta ?? '{}').username;

    //preserve username in localStorage as it is used to fill signin textbox on signout
    localStorage.kanyimuta = JSON.stringify({ username });
  }

  delay(1500).then(() => {
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
  });

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
