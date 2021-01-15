import {
  ReduxAction,
  FORGOT_PASSWORD_PENDING,
  FORGOT_PASSWORD_COMPLETED,
  FORGOT_PASSWORD_REQUEST
} from '../../constants';
import { http } from '../../functions';
import { displaySnackbar } from '../misc';

export const doForgotPassword = (email: string) => (
  dispatch: Function
): ReduxAction => {
  dispatch(forgotPasswordPending());

  http
    .post('/auth/pass/reset/request', {
      email
    })
    .finally(() => {
      dispatch(forgotPasswordCompleted());
      dispatch(
        displaySnackbar({
          open: true,
          message: 'Password reset link has been sent!',
          severity: 'success',
          autoHide: true
        })
      );
    });

  return {
    type: FORGOT_PASSWORD_REQUEST
  };
};

export const forgotPasswordPending = () => {
  return {
    type: FORGOT_PASSWORD_PENDING,
    payload: { status: 'pending' }
  };
};

export const forgotPasswordCompleted = () => {
  return {
    type: FORGOT_PASSWORD_COMPLETED,
    payload: { status: 'completed' }
  };
};
