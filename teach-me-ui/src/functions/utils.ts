import { ReduxAction, StatusPropsState } from '../constants';
import store from '../appStore';
import {
  online,
  signup,
  signin,
  auth,
  setDisplayName,
  validateEmail,
  validateUsername,
  validateLastname,
  validateFirstname,
  displaySnackbar
} from '../actions';
import { database } from '../firebase';

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}

let timeoutToGiveFeedback: any;
let timeoutToAbortNetworkAction: any;
export function callNetworkStatusChecker(networkAction: 'signup' | 'signin') {
  //clear timeout in case it's already been initialized by multiple submit actions
  clearTimeout(timeoutToGiveFeedback);
  clearTimeout(timeoutToAbortNetworkAction);

  promisedDispatch(online(navigator.onLine)).then(() => {
    let state: any;
    let networkStatusChecker = setInterval(() => {
      let noInternetResponse: StatusPropsState = {
        status: 'settled',
        err: true,
        statusText: 'You are offline. Check your internet.'
      };

      state = getState();

      if (
        !navigator.onLine ||
        /settled|fulfilled/.test(state[networkAction]?.status)
      )
        clearInterval(networkStatusChecker);

      switch (networkAction) {
        case 'signup':
          if (state.signup.status === 'pending' && !navigator.onLine) {
            dispatch(signup({ ...noInternetResponse }));
            dispatch(
              displaySnackbar({
                open: true,
                message: noInternetResponse.statusText,
                severity: 'error'
              })
            );
          }
          break;
        case 'signin':
          if (state.signin.status === 'pending' && !navigator.onLine) {
            dispatch(signin({ ...noInternetResponse }));
            dispatch(
              displaySnackbar({
                open: true,
                message: noInternetResponse.statusText,
                severity: 'error'
              })
            );
          }
          break;
      }

      dispatch(online(navigator.onLine));
    }, 1500);

    //if after 12 seconds of sending request there's no response, throw a network error feedback to user
    timeoutToGiveFeedback = setTimeout(() => {
      if (navigator.onLine && state[networkAction]?.status === 'pending') {
        let errFeedback: StatusPropsState = {
          status: 'pending',
          err: true,
          statusText:
            "Network is taking too long to respond. Sure you're connected?"
        };
        let abortionFeedback: StatusPropsState = {
          status: 'settled',
          err: true,
          statusText:
            'Something seems to be wrong with your data connection. Contact your Service Provider.'
        };

        switch (networkAction) {
          case 'signup':
            dispatch(
              displaySnackbar({
                open: true,
                message: errFeedback.statusText,
                severity: 'error'
              })
            );
            dispatch(signup({ ...errFeedback }));
            timeoutToAbortNetworkAction = setTimeout(() => {
              if (navigator.onLine && state.signup.status === 'pending') {
                dispatch(signup({ ...abortionFeedback }));
                dispatch(
                  displaySnackbar({
                    open: true,
                    message: abortionFeedback.statusText,
                    severity: 'error'
                  })
                );
              }
            }, 8000);
            break;
          case 'signin':
            dispatch(
              displaySnackbar({
                open: true,
                message: errFeedback.statusText,
                severity: 'error'
              })
            );
            dispatch(signin({ ...errFeedback }));
            timeoutToAbortNetworkAction = setTimeout(() => {
              if (navigator.onLine && state.signin.status === 'pending') {
                dispatch(signin({ ...abortionFeedback }));
                dispatch(
                  displaySnackbar({
                    open: true,
                    message: abortionFeedback.statusText,
                    severity: 'error'
                  })
                );
              }
            }, 8000);
            break;
        }
      }
    }, 10000);
  });
}

export function populateStateWithUserData(email: string) {
  return database
    .ref(`users/students/${email.replace(/\./g, '')}`)
    .once('value')
    .then((snapshot) => {
      //update/populate state with user details after signin
      if (snapshot.val()) {
        const {
          firstname,
          lastname,
          username,
          email,
          displayName
        } = snapshot.val();
        //using same action creators for validation to set state values as it was used
        promisedDispatch(validateFirstname({ value: firstname })).then(() => {
          dispatch(
            signin({
              status: 'fulfilled',
              err: false
            })
          );
          dispatch(auth({ status: 'fulfilled', isAuthenticated: true }));
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Sign in success!',
              severity: 'success',
              autoHide: true
            })
          );
        });
        dispatch(validateLastname({ value: lastname }));
        dispatch(validateUsername({ value: username }));
        dispatch(validateEmail({ value: email }));
        dispatch(setDisplayName(displayName));
      } else {
        dispatch(auth({ status: 'settled', isAuthenticated: false }));
      }
    });
}
