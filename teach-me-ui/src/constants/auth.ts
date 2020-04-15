import { StatusPropsState, AuthState } from './interfaces';

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST';
export const SIGNUP_USER = 'SIGNUP_USER';
export const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
export const SIGNIN_USER = 'SIGNIN_USER';
export const SIGNOUT_REQUEST = 'SIGNOUT_REQUEST';
export const SIGNOUT_USER = 'SIGNOUT_USER';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const VERIFY_AUTH = 'VERIFY_AUTH';
export const SET_USER_DISPLAY_NAME = 'SET_USER_DISPLAY_NAME';

export const authState: AuthState = {
  status: 'settled',
  isAuthenticated: false
};

export const statusPropsState: StatusPropsState = {
  status: 'settled',
  err: false,
  statusText: ' '
};

export const signupState: StatusPropsState = {
  ...statusPropsState
};

export const signinState: StatusPropsState = {
  ...statusPropsState
};

export const signoutState: StatusPropsState = {
  ...statusPropsState
};