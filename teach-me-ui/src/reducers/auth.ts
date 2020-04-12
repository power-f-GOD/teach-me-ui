import {
  SIGNUP_USER,
  StatusPropsState,
  ReduxAction,
  signinState,
  SIGNIN_USER,
  authState,
  signupState,
  AUTHENTICATE_USER,
  AuthState,
  SIGNOUT_USER,
  signoutState,
  SET_USER_DISPLAY_NAME
} from '../constants';

export const signup = (
  state: StatusPropsState = signupState,
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
  state: StatusPropsState = signinState,
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

export const auth = (state: AuthState = authState, action: ReduxAction) => {
  if (action.type === AUTHENTICATE_USER) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const signout = (
  state: StatusPropsState = signoutState,
  action: ReduxAction
) => {
  if (action.type === SIGNOUT_USER) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const displayName = (state: string = 'User', action: ReduxAction) => {
  if (action.type === SET_USER_DISPLAY_NAME) {
    return action.payload;
  }
  return state;
};
