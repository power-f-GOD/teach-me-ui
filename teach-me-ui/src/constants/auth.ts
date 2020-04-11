import { AuthPropsState } from './interfaces';

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST';
export const SIGNUP_USER = 'SIGNUP_USER';
export const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
export const SIGNIN_USER = 'SIGNIN_USER';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';

export const authState: AuthPropsState = {
  status: 'settled',
  err: false,
  success: false,
  statusMsg: ' '
};

export const signupState: AuthPropsState = {
  ...authState
};

export const signinState: AuthPropsState = {
  ...authState
};
