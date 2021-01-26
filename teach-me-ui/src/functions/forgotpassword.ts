import { dispatch } from '../utils';

import { doForgotPassword, doResetPassword } from '../actions';

export const handleForgotPasswordRequest = (email: string) => {
  dispatch(doForgotPassword(email)(dispatch));
};

export const handleResetPasswordRequest = (
  password: string,
  token: string,
  callback: Function
) => {
  dispatch(doResetPassword(password, token, callback)(dispatch));
};
