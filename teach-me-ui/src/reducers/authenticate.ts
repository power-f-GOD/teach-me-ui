import {
  signupState,
  SIGNUP_USER,
  SignupState,
  ReduxAction
} from '../constants';

export const signup = (
  state: SignupState = signupState.signup,
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
