import { SIGNIN_USER, SIGNIN_REQUEST } from '../../constants';
import {
  ReduxAction,
  StatusPropsState,
  SigninFormData,
  UserData
} from '../../types';
import { validateSigninId, validateSigninPassword } from '../validate';
import {
  checkNetworkStatusWhilstPend,
  populateStateWithUserData,
  logError,
  http
} from '../../functions';
import { displaySnackbar } from '../misc';
import { auth } from './auth';

export const requestSignin = (data: SigninFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signin({ status: 'pending' }));
  checkNetworkStatusWhilstPend({ name: 'signin', func: signin });

  let { id, password } = data;
  let identity = id;

  http
    .post<UserData>('/auth/login', {
      identity,
      password
    })
    .then(({ error, message, data: userData }) => {
      if (!error) {
        const displayName = `${userData.first_name} ${userData.last_name}`;

        populateStateWithUserData({
          ...userData,
          displayName
        }).then(() => {
          http.token = userData.token!;
          dispatch(signin({ status: 'fulfilled' }));
          dispatch(auth({ status: 'settled', isAuthenticated: true }));
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Welcome back!',
              severity: 'success',
              autoHide: true
            })
          );

          //set token for user session and subsequent authentication
          if (navigator.cookieEnabled) {
            localStorage.kanyimuta = JSON.stringify({
              ...userData,
              displayName
            });
          }
        });
      } else {
        switch (true) {
          case /details?|account/i.test(message!):
            dispatch(
              validateSigninId({
                value: id,
                err: true,
                helperText: `${
                  /@/.test(id) ? 'Email' : 'Username'
                } does not match our records.`
              })
            );
            break;
          case /password.+(invalid)?/i.test(message!):
            dispatch(
              validateSigninPassword({
                value: password,
                err: true,
                helperText: 'Password incorrect.'
              })
            );
            break;
          default:
            dispatch(
              displaySnackbar({
                open: true,
                message,
                severity: 'error'
              })
            );
        }

        dispatch(
          signin({
            status: 'settled',
            err: error
          })
        );
      }
    })
    .catch(logError(signin));

  return {
    type: SIGNIN_REQUEST
  };
};

export function signin(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNIN_USER,
    payload
  };
}
