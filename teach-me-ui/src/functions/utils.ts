import { ReduxAction, AuthPropsState } from '../constants';
import store from '../appStore';
import { online, signup, signin } from '../actions';

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}

export function callNetworkStatusChecker(networkAction: 'signup' | 'signin') {
  promisedDispatch(online(navigator.onLine)).then(() => {
    let state: any;
    let networkStatusChecker = setInterval(() => {
      let noInternetResponse: AuthPropsState = {
        status: 'settled',
        err: true,
        success: false,
        statusMsg: 'You are offline. Check your internet connection.'
      };

      state = getState();

      if (!state.online) clearInterval(networkStatusChecker);

      switch (networkAction) {
        case 'signup':
          if (state.signup.status === 'pending' && !navigator.onLine) {
            dispatch(signup({ ...noInternetResponse }));
            dispatch(online(false));
          }
          break;
        case 'signin':
          if (state.signin.status === 'pending' && !navigator.onLine) {
            dispatch(signin({ ...noInternetResponse }));
            dispatch(online(false));
          }
          break;
      }
    }, 2000);

    //if after 10 seconds of sending request there's no response, throw a network error feedback to user
    setTimeout(() => {
      if (navigator.onLine) {
        let errFeedback: AuthPropsState = {
          status: 'pending',
          err: true,
          success: false,
          statusMsg:
            "Network is taking too long to respond. Check and ensure you're connected to the internet."
        };

        if (state?.signin.status === 'pending') {
          dispatch(signin({ ...errFeedback }));
        }

        if (state?.signup.status === 'pending') {
          dispatch(signup({ ...errFeedback }));
        }

        clearInterval(networkStatusChecker);
      }
    }, 10000);
  });
}
