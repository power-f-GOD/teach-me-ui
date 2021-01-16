import { FORGOT_PASSWORD_REQUEST } from '../../constants';
import { ReduxAction } from '../../types';
import { http } from '../../functions';
import { displaySnackbar } from '../misc';
import {
  forgotPasswordCompleted,
  forgotPasswordPending
} from './forgotPassword';

export const doResetPassword = (
  password: string,
  token: string,
  callback: Function
) => (dispatch: Function): ReduxAction => {
  dispatch(forgotPasswordPending());

  http
    .post<any>('/auth/pass/reset', {
      reset_token: token,
      password
    })
    .then(({ error, message }) => {
      dispatch(forgotPasswordCompleted());
      let _message: string = '';
      if (/(token .+ decoded|reset .+ expired)/.test(message!)) {
        _message = 'Password reset link has expired.';
      } else if (/changed/.test(message!)) {
        _message = 'Password has been changed successfully';
      } else {
        _message = message!;
      }
      dispatch(
        displaySnackbar({
          open: true,
          message: _message,
          severity: error ? 'error' : 'success',
          autoHide: true
        })
      );
      if (!error) {
        callback();
      }
    });
  return {
    type: FORGOT_PASSWORD_REQUEST
  };
};
