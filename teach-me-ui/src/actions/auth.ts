import {
  ReduxAction,
  SIGNUP_REQUEST,
  SIGNUP_USER,
  SignupFormData,
  AuthPropsState,
  AUTHENTICATE_USER,
  SIGNIN_USER,
  SIGNIN_REQUEST,
  SigninFormData
} from '../constants';
import { teachMeApp, database } from '../firebase';
import {
  validateEmail,
  validateUsername,
  validateSigninId,
  validateSigninPassword
} from './validate';
import { callNetworkStatusChecker } from '../functions';

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signup({ status: 'pending', statusMsg: ' ' }));

  let { firstname, lastname, username, email, password } = data;

  firstname = `${firstname[0].toUpperCase()}${firstname.slice(1)}`;
  lastname = `${lastname[0].toUpperCase()}${lastname.slice(1)}`;

  //check if user is online as lost network connection is not a failure state for Firebase db in order to give response to user
  callNetworkStatusChecker('signup');

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
          signup({
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
                signup({
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
                    dispatch(signup({ status: 'fulfilled' }));
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
                signup({
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

export function signup(payload: AuthPropsState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload
  };
}

export const requestSignin = (data: SigninFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signin({ status: 'pending', statusMsg: ' ' }));

  let { signinId, signinPassword } = data;

  if (!/.+@.+\..+/.test(signinId) && /^\w+$/.test(signinId)) {
    callNetworkStatusChecker('signin');

    database
      .ref(`users/students/${signinId}`)
      .once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          signinWithEmailAndPassword(snapshot.val().email, signinPassword);
        } else {
          dispatch(
            signin({
              status: 'settled',
              err: true,
              success: false
            })
          );
          dispatch(
            validateSigninId({
              value: signinId,
              err: true,
              helperText: "Username doesn't exist."
            })
          );
        }
      });
  } else {
    signinWithEmailAndPassword(signinId, signinPassword);
  }

  function signinWithEmailAndPassword(email: string, password: string) {
    return teachMeApp
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((user) => {
        if (user) {
          // const displayName = String(user);
          dispatch(
            signin({
              status: 'fulfilled',
              err: false,
              success: true,
              statusMsg: 'Signin success!'
            })
          );
        }
      })
      .catch((error) => {
        let displayStatusMsg = false;
        let statusMsg = error.message;

        if (/password/.test(statusMsg)) {
          dispatch(
            validateSigninPassword({
              value: signinPassword,
              err: true,
              helperText: 'Password incorrect.'
            })
          );
        } else if (/credential|user|record/.test(statusMsg)) {
          dispatch(
            validateSigninId({
              value: signinId,
              err: true,
              helperText: 'Email does not exist.'
            })
          );
        } else {
          displayStatusMsg = true;
        }

        dispatch(
          signin({
            status: 'settled',
            err: true,
            success: false,
            statusMsg: displayStatusMsg ? statusMsg : ' '
          })
        );
        console.error('An error occured: ', statusMsg);
      });
  }

  return {
    type: SIGNIN_REQUEST
  };
};

export function signin(payload: AuthPropsState): ReduxAction {
  return {
    type: SIGNIN_USER,
    payload
  };
}

export const auth = (payload: AuthPropsState): ReduxAction => {
  return {
    type: AUTHENTICATE_USER,
    payload
  };
};
