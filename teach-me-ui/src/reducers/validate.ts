import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  signupState,
  SignupState,
} from '../constants';

export const validate = (
  state: SignupState = { ...signupState },
  action: ReduxAction
) => {
  let newState = action.newState;

  switch (action.type) {
    case FIRSTNAME_VALIDATE:
      return { ...state, ...newState };
    case LASTNAME_VALIDATE:
      return { ...state, ...newState };
    case USERNAME_VALIDATE:
      return { ...state, ...newState };
    case EMAIL_VALIDATE:
      return { ...state, ...newState };
    case PASSWORD_VALIDATE:
      return { ...state, ...newState };
    default:
      return state;
  }
};
