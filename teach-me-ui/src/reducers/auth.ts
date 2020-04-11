import {
  SIGNUP_USER,
  AuthPropsState,
  ReduxAction,
  signinState,
  SIGNIN_USER,
  authState,
  signupState,
  AUTHENTICATE_USER
} from '../constants';

export const signup = (
  state: AuthPropsState = signupState,
  action: ReduxAction
) => {
  if (action.type === SIGNUP_USER) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const signin = (
  state: AuthPropsState = signinState,
  action: ReduxAction
) => {
  if (action.type === SIGNIN_USER) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const auth = (
  state: AuthPropsState = authState,
  action: ReduxAction
) => {
  if (action.type === AUTHENTICATE_USER) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
