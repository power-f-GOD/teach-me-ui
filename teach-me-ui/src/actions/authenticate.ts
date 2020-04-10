import {
  ReduxAction,
  SIGNUP_REQUEST,
  SIGNUP_USER,
  SignupFormData,
  SignupState
} from '../constants';
import { teachMeApp, database } from '../firebase';
import { validateEmail, validateUsername } from './validate';
import { getState } from '../functions';

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signupUser({ status: 'pending', statusMsg: ' ' }));

  let { firstname, lastname, username, email, password } = data;

  firstname = `${firstname[0].toUpperCase()}${firstname.slice(1)}`;
  lastname = `${lastname[0].toUpperCase()}${lastname.slice(1)}`;

  let onlineChecker = setInterval(() => {
    //check if user is online (every 3 seconds) as lost network connection is not a failure state for Firebase in order to give response to user
    if (getState().signup.status === 'pending' && !navigator.onLine) {
      dispatch(
        signupUser({
          status: 'settled',
          err: true,
          success: false,
          statusMsg:
            'A network error (such as timeout, interrupted connection or unreachable host) has occurred.'
        })
      );
      clearInterval(onlineChecker);
    }
  }, 2000);

  //first check if username already exists before signing user up
  database
    .ref(`users/students/${username}`)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        if (email === snapshot.val().email) {
          dispatch(
            validateEmail({
              value: email,
              err: true,
              helperText: 'The email is already in use by another account.'
            })
          );
        }

        dispatch(
          validateUsername({
            value: username,
            err: true,
            helperText:
              'The username already exists. Kindly use another or sign in.'
          })
        );
        dispatch(
          signupUser({
            status: 'settled',
            err: true,
            success: false,
            statusMsg: ' '
          })
        );
      } else {
        teachMeApp
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then((user) => {
            if (user) {
              const displayName = `${firstname} ${lastname}`;
              dispatch(
                signupUser({
                  status: 'pending',
                  err: false,
                  success: true,
                  statusMsg: `Sign up success! Welcome, ${firstname}!`
                })
              );
              //now populate database with the rest of user data after sign up
              return database
                .ref(`users/students/${username}`)
                .set({
                  ...data,
                  displayName,
                  firstname,
                  lastname
                })
                .then(() => {
                  setTimeout(() => {
                    dispatch(signupUser({ status: 'fulfilled' }));
                  }, 1000);
                });
            }
          })
          .catch((error) => {
            if (/email.+in-use/.test(error.code)) {
              dispatch(
                validateEmail({
                  value: email,
                  err: true,
                  helperText: error.message
                })
              );
            } else {
              dispatch(
                signupUser({
                  status: 'settled',
                  err: true,
                  success: false,
                  statusMsg: error.message
                })
              );
              console.error('An error occured: ', error.message);
            }
          });
      }
    });

  return {
    type: SIGNUP_REQUEST
  };
};

export function signupUser(payload: SignupState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload
  };
}
