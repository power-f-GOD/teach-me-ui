import { ReduxAction, StatusPropsState, UserData } from '../constants';
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

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    dispatch(action);
    setTimeout(() => resolve(action), 100);
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
    const errFeedback: StatusPropsState = {
      status: 'pending',
      err: true,
      statusText:
        "Network is taking too long to respond. Sure you're connected?"
    };
    const abortionFeedback: StatusPropsState = {
      status: 'settled',
      err: true,
      statusText:
        'Something seems to be wrong with your data connection. Contact your Service Provider.'
    };
    const noInternetResponse: StatusPropsState = {
      status: 'settled',
      err: true,
      statusText: 'You are offline. Check your internet.'
    };

    const networkStatusChecker = setInterval(() => {
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
        switch (networkAction) {
          case 'signup':
            callTimeoutToAbortNetworkAction('signup');
            break;
          case 'signin':
            callTimeoutToAbortNetworkAction('signin');
            break;
        }
      }
    }, 10000);

    function callTimeoutToAbortNetworkAction(networkAction: string) {
      switch (networkAction) {
        case 'signup':
          dispatch(signup({ ...errFeedback }));
          break;
        case 'signin':
          dispatch(signin({ ...errFeedback }));
          break;
      }

      dispatch(
        displaySnackbar({
          open: true,
          message: errFeedback.statusText,
          severity: 'error'
        })
      );

      timeoutToAbortNetworkAction = setTimeout(() => {
        if (navigator.onLine && state[networkAction].status === 'pending') {
          switch (networkAction) {
            case 'signup':
              dispatch(signup({ ...abortionFeedback }));
              break;
            case 'signin':
              dispatch(signin({ ...abortionFeedback }));
              break;
          }

          dispatch(
            displaySnackbar({
              open: true,
              message: abortionFeedback.statusText,
              severity: 'error'
            })
          );
        }
      }, 8000);
    }
  });
}

export function populateStateWithUserData(data: UserData) {
  const { firstname, lastname, username, email, displayName } = data;

  //using same action creators for validation to set state values as it was used
  return promisedDispatch(setDisplayName(displayName)).then(() => {
    dispatch(validateFirstname({ value: firstname }));
    dispatch(validateLastname({ value: lastname }));
    dispatch(validateUsername({ value: username }));
    promisedDispatch(validateEmail({ value: email })).then(() => {
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
  });
}

export const logError = (action: Function) => (error: any) => {
  let message = /network/i.test(error.message)
        ? 'A network error occurred. Check your internet connection.'
        : error.message;

      dispatch(
        action({
          status: 'settled',
          err: true
        })
      );
      dispatch(
        displaySnackbar({
          open: true,
          message,
          severity: 'error'
        })
      );
      console.error('An error occured: ', message);
}
