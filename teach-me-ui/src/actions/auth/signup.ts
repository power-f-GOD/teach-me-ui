import { SIGNUP_REQUEST, SIGNUP_USER, PLACEHOLDER_BIO } from '../../constants';
import {
  SignupFormData,
  StatusPropsState,
  ReduxAction,
  UserData
} from '../../types';
import { validateEmail, validateUsername } from './validate';
import {
  checkNetworkStatusWhilstPend,
  populateStateWithUserData,
  logError,
  http
} from '../../functions';
import { displaySnackbar } from '../misc';
import { auth } from './auth';

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  let {
    first_name,
    last_name,
    username,
    email,
    dob,
    password,
    institution,
    department,
    level
  } = data;
  const [day, month, year] = dob.split('/');
  const date_of_birth = `${year}-${month}-${day}`;

  dispatch(signup({ status: 'pending', statusText: ' ' }));
  //check if user is online as lost network connection is not a failure state for Firebase db in order to give response to user
  checkNetworkStatusWhilstPend({ name: 'signup', func: signup });

  http
    .post<UserData>('/auth/register', {
      first_name,
      last_name,
      username,
      email,
      date_of_birth,
      password,
      institution_id: institution,
      department,
      level
    })
    .then(({ error, message, data }) => {
      if (!error) {
        const displayName = `${first_name} ${last_name}`;

        populateStateWithUserData({
          ...data,
          displayName,
          bio: data.bio || PLACEHOLDER_BIO
        }).then(() => {
          http.token = data.token!;
          dispatch(signup({ status: 'fulfilled' }));
          dispatch(auth({ status: 'settled', isAuthenticated: true }));
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Sign up success!',
              severity: 'success',
              autoHide: true
            })
          );

          //set token for user session and subsequent authentication
          if (navigator.cookieEnabled) {
            localStorage.kanyimuta = JSON.stringify({
              ...data,
              displayName,
              dob
            });
          }
        });
      } else {
        switch (true) {
          case /username.+(taken|used?)/i.test(message!):
            dispatch(
              validateUsername({
                value: username,
                err: true,
                helperText: 'The username is already taken. Kindly use another.'
              })
            );
            break;
          case /email.+(taken|used?)/i.test(message!):
            dispatch(
              validateEmail({
                value: email,
                err: true,
                helperText: 'The email is already in use by another account.'
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
          signup({
            status: 'settled',
            err: error
          })
        );
      }
    })
    .catch(logError(signup));

  return {
    type: SIGNUP_REQUEST
  };
};

export function signup(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload
  };
}
