import { SignupState } from "./interfaces";

export const FIRSTNAME_VALIDATE = 'FIRSTNAME_VALIDATE';
export const LASTNAME_VALIDATE = 'LASTNAME_VALIDATE';
export const USERNAME_VALIDATE = 'USERNAME_VALIDATE';
export const EMAIL_VALIDATE = 'EMAIL_VALIDATE';
export const PASSWORD_VALIDATE = 'PASSWORD_VALIDATE';

export const signupState: SignupState = {
  firstname: '',
  firstnameErr: false,
  firstnameHelperText: ' ',
  lastname: '',
  lastnameErr: false,
  lastnameHelperText: ' ',
  username: '',
  usernameErr: false,
  usernameHelperText: ' ',
  email: '',
  emailErr: false,
  emailHelperText: ' ',
  password: '',
  passwordErr: false,
  passwordHelperText: ' '
};
