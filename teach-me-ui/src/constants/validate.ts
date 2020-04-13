import { SignupPropsState, InputPropsState, SigninPropsState } from './interfaces';

export const FIRSTNAME_VALIDATE = 'FIRSTNAME_VALIDATE';
export const LASTNAME_VALIDATE = 'LASTNAME_VALIDATE';
export const USERNAME_VALIDATE = 'USERNAME_VALIDATE';
export const EMAIL_VALIDATE = 'EMAIL_VALIDATE';
export const PASSWORD_VALIDATE = 'PASSWORD_VALIDATE';

export const SIGNIN_ID_VALIDATE = 'SIGNIN_ID_VALIDATE';
export const SIGNIN_PASSWORD_VALIDATE = 'SIGNIN_PASSWORD_VALIDATE';

export const inputState: InputPropsState = {
  value: '',
  err: false,
  helperText: ' '
};

export const signupProps: SignupPropsState = {
  firstname: { ...inputState },
  lastname: { ...inputState },
  username: { ...inputState },
  email: { ...inputState },
  password: { ...inputState }
};

export const signinProps: SigninPropsState = {
  signinId: { ...inputState },
  signinPassword: { ...inputState }
};
