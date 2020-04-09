import {
  ReduxAction,
  SIGNUP_REQUEST,
  SIGNUP_USER,
  SignupFormData,
  SignupState,
} from '../constants';
import { teachMeApp, database } from '../firebase';
import { validateEmail, validateUsername } from './validate';

export const requestSignup = (data: SignupFormData) => (
  dispatch: Function
): ReduxAction => {
  dispatch(signupUser({ status: 'pending', statusMsg: ' ' }));

  let { firstname, lastname, username, email, password } = data;

  firstname = `${firstname[0].toUpperCase()}${firstname.slice(1)}`;
  lastname = `${lastname[0].toUpperCase()}${lastname.slice(1)}`;

  //first check if username already exists before signing user up
  database
    .ref(`users/students/${username}`)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        let statusMsg = 'The username already exists. Kindly use another.';

        dispatch(
          validateUsername({
            value: username,
            err: true,
            helperText: statusMsg,
          })
        );
        dispatch(
          signupUser({
            status: 'settled',
            err: true,
            success: false,
            statusMsg,
          })
        );
      } else {
        return teachMeApp
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
                  statusMsg: `Sign up success! Welcome, ${firstname}!`,
                })
              );
              //now populate database with the rest of user data after sign up
              return database
                .ref(`users/students/${username}`)
                .set({
                  ...data,
                  displayName,
                  firstname,
                  lastname,
                })
                .then(() => {
                  setTimeout(() => {
                    dispatch(signupUser({ status: 'fulfilled' }));
                  }, 1000);
                });
            }
          });
      }
    })
    .catch((error) => {
      if (/email.+in-use/.test(error.code)) {
        dispatch(
          validateEmail({
            value: email,
            err: true,
            helperText: error.message,
          })
        );
      }
      dispatch(
        signupUser({
          status: 'settled',
          err: true,
          success: false,
          statusMsg: error.message,
        })
      );
      console.error('An error occured: ', error.message);
    });

  return {
    type: SIGNUP_REQUEST,
  };
};

export function signupUser(payload: SignupState): ReduxAction {
  return {
    type: SIGNUP_USER,
    payload,
  };
}
