import {
  SIGNUP_USER,
  FORGOT_PASSWORD_PENDING,
  FORGOT_PASSWORD_COMPLETED,
  signinState,
  SIGNIN_USER,
  authState,
  signupState,
  AUTHENTICATE_USER,
  SIGNOUT_USER,
  signoutState,
  forgotPasswordStatusState
} from '../constants';
import {
  AuthState,
  StatusPropsState,
  ForgotPasswordStatusState,
  ReduxAction
} from '../types';

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

export const forgotPasswordStatus = (
  state: ForgotPasswordStatusState = forgotPasswordStatusState,
  action: ReduxAction
) => {
  if (action.type === FORGOT_PASSWORD_PENDING) {
    return {
      status: 'pending'
    };
  } else if (action.type === FORGOT_PASSWORD_COMPLETED) {
    return {
      status: 'completed'
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
