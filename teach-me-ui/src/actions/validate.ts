import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction
} from '../constants';

export const validateFirstname = (value: string): ReduxAction => {
  return {
    type: FIRSTNAME_VALIDATE,
    payload: value,
  };
};

export const validateLastname = (value: string): ReduxAction => {
  return {
    type: LASTNAME_VALIDATE,
    payload: value,
  };
};

export const validateUsername = (value: string): ReduxAction => {
  return {
    type: USERNAME_VALIDATE,
    payload: value,
  };
};

export const validateEmail = (value: string): ReduxAction => {
  return {
    type: EMAIL_VALIDATE,
    payload: value,
  };
};

export const validatePassword = (value: string): ReduxAction => {
  return {
    type: PASSWORD_VALIDATE,
    payload: value,
  };
};
