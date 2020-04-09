import { SignupState, InputState } from './interfaces';

export const FIRSTNAME_VALIDATE = 'FIRSTNAME_VALIDATE';
export const LASTNAME_VALIDATE = 'LASTNAME_VALIDATE';
export const USERNAME_VALIDATE = 'USERNAME_VALIDATE';
export const EMAIL_VALIDATE = 'EMAIL_VALIDATE';
export const PASSWORD_VALIDATE = 'PASSWORD_VALIDATE';

export const inputState: InputState = {
  value: '',
  err: false,
  helperText: ' ',
};

export const signupState: SignupState = {
  firstname: { ...inputState },
  lastname: { ...inputState },
  username: { ...inputState },
  email: { ...inputState },
  password: { ...inputState },
};
