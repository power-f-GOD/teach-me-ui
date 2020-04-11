import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  InputPropsState,
  SIGNIN_ID_VALIDATE,
  SIGNIN_PASSWORD_VALIDATE
} from '../constants';

export const validateFirstname = (payload: InputPropsState): ReduxAction => {
  return {
    type: FIRSTNAME_VALIDATE,
    payload
  };
};

export const validateLastname = (payload: InputPropsState): ReduxAction => {
  return {
    type: LASTNAME_VALIDATE,
    payload
  };
};

export const validateUsername = (payload: InputPropsState): ReduxAction => {
  return {
    type: USERNAME_VALIDATE,
    payload
  };
};

export const validateEmail = (payload: InputPropsState): ReduxAction => {
  return {
    type: EMAIL_VALIDATE,
    payload
  };
};

export const validatePassword = (payload: InputPropsState): ReduxAction => {
  return {
    type: PASSWORD_VALIDATE,
    payload
  };
};

export const validateSigninId = (payload: InputPropsState): ReduxAction => {
  return {
    type: SIGNIN_ID_VALIDATE,
    payload
  }
}

export const validateSigninPassword = (payload: InputPropsState): ReduxAction => {
  return {
    type: SIGNIN_PASSWORD_VALIDATE,
    payload
  }
}