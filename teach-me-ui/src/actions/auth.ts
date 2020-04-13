import {
  ReduxAction,
  SIGNUP_REQUEST,
  SIGNUP_USER,
  SignupFormData,
  StatusPropsState,
  AUTHENTICATE_USER,
  SIGNIN_USER,
  SIGNIN_REQUEST,
  SigninFormData,
  AuthState,
  VERIFY_AUTH,
  SIGNOUT_REQUEST,
  SIGNOUT_USER,
  SET_USER_DISPLAY_NAME
} from '../constants';
import { teachMeApp, database } from '../firebase';
import {
  validateEmail,
  validateUsername,
  validateSigninId,
  validateSigninPassword
} from './validate';
import {
  callNetworkStatusChecker,
  populateStateWithUserData
} from '../functions';

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signup({ status: 'pending', statusText: ' ' }));

  let { firstname, lastname, username, email, password } = data;

  firstname = `${firstname[0].toUpperCase()}${firstname.slice(1).toLowerCase()}`;
  lastname = `${lastname[0].toUpperCase()}${lastname.slice(1).toLowerCase()}`;

  //check if user is online as lost network connection is not a failure state for Firebase db in order to give response to user
  callNetworkStatusChecker('signup');

  //first check if username already exists before signing user up
  database
    .ref(`users/students/${email.replace(/\./g, '')}`)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        if (username === snapshot.val().username) {
          dispatch(
            validateUsername({
              value: username,
              err: true,
              helperText:
                'The username already exists. Kindly use another or sign in.'
            })
          );
        }

        dispatch(
          validateEmail({
            value: email,
            err: true,
            helperText: 'The email is already in use by another account.'
          })
        );
        dispatch(
          signup({
            status: 'settled',
            err: true,
            statusText: ' '
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
                  statusText: ' '
                })
              );
              dispatch(auth({ status: 'settled', isAuthenticated: true }));

              //now populate database with the rest of user data after sign up
              return (
                database
                  //replacing dots in email as database doesn't accept them
                  .ref(`users/students/${email.replace(/\./g, '')}`)
                  .set({
                    ...data,
                    displayName,
                    firstname,
                    lastname,
                    password: ''
                  })
                  .then(() => {
                    // teachMeApp
                    //   .auth()
                    //   .currentUser?.updateProfile({ displayName });
                    setTimeout(() => {
                      dispatch(signup({ status: 'fulfilled' }));
                    }, 1000);
                  })
              );
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
                  statusText: error.message
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

export function signup(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload
  };
}

export const requestSignin = (data: SigninFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signin({ status: 'pending', statusText: ' ' }));

  let { email, password } = data;

  teachMeApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      if (user) {
        populateStateWithUserData(email);
      }
    })
    .catch((error) => {
      let displayStatusText = false;
      let statusText = error.message;

      if (/password/.test(statusText)) {
        dispatch(
          validateSigninPassword({
            value: password,
            err: true,
            helperText: 'Password incorrect.'
          })
        );
      } else if (/credential|user|record|email/.test(statusText)) {
        dispatch(
          validateSigninId({
            value: email,
            err: true,
            helperText: /@/.test(email)
              ? 'Email does not exist. Sign up instead.'
              : 'Invalid input. Enter your email address.'
          })
        );
      } else {
        displayStatusText = true;
      }

      dispatch(
        signin({
          status: 'settled',
          err: true,
          statusText: displayStatusText ? statusText : ' '
        })
      );
      console.error('An error occured: ', statusText);
    });

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

export const verifyAuth = () => (dispatch: Function): ReduxAction => {
  dispatch(auth({ status: 'pending' }));

  teachMeApp.auth().onAuthStateChanged((user) => {
    if (user) {
      populateStateWithUserData(user.email as string);
    } else {
      dispatch(auth({ status: 'fulfilled', isAuthenticated: false }));
      dispatch(signin({ status: 'fulfilled', err: true }));
    }
  });

  return {
    type: VERIFY_AUTH
  };
};

export function auth(payload: AuthState): ReduxAction {
  return {
    type: AUTHENTICATE_USER,
    payload
  };
}

export const requestSignout = () => (dispatch: Function): ReduxAction => {
  dispatch(signout({ status: 'pending', statusText: ' ' }));

  teachMeApp
    .auth()
    .signOut()
    .then(() => {
      dispatch(
        signout({
          status: 'fulfilled',
          err: false,
          statusText: 'You are signed out.'
        })
      );
      dispatch(auth({ status: 'fulfilled', isAuthenticated: false }));
    })
    .catch((error) => {
      dispatch(
        signout({
          status: 'settled',
          err: true,
          statusText: 'Something went wrong:' + error.message
        })
      );
      dispatch(auth({ status: 'settled', isAuthenticated: true }));
      console.error('An error occurred: ', error.message);
    });

  return {
    type: SIGNOUT_REQUEST
  };
};

export function signout(payload: StatusPropsState): ReduxAction {
  return {
    type: SIGNOUT_USER,
    payload
  };
}

export function setDisplayName(payload: string): ReduxAction {
  return {
    type: SET_USER_DISPLAY_NAME,
    payload
  };
}
