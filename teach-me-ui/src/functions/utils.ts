import { ReduxAction, StatusPropsState } from '../constants';
import store from '../appStore';
import { online, signup, signin } from '../actions';

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}

let timeout: any;
export function callNetworkStatusChecker(networkAction: 'signup' | 'signin') {
  //clear timeout in case it's already been initialized by multiple submit actions
  clearTimeout(timeout);

  promisedDispatch(online(navigator.onLine)).then(() => {
    let state: any;
    let networkStatusChecker = setInterval(() => {
      let noInternetResponse: StatusPropsState = {
        status: 'settled',
        err: true,
        statusText: 'You are offline. Reconnect to the internet.'
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
          }
          break;
        case 'signin':
          if (state.signin.status === 'pending' && !navigator.onLine) {
            dispatch(signin({ ...noInternetResponse }));
          }
          break;
      }

      dispatch(online(navigator.onLine));
    }, 1500);

    //if after 12 seconds of sending request there's no response, throw a network error feedback to user
    timeout = setTimeout(() => {
      if (navigator.onLine && state[networkAction]?.status === 'pending') {
        let errFeedback: StatusPropsState = {
          status: 'pending',
          err: true,
          statusText:
            "Network is taking too long to respond. Check and ensure you're connected to the internet."
        };

        switch (networkAction) {
          case 'signup':
            dispatch(signup({ ...errFeedback }));
            break;
          case 'signin':
            dispatch(signin({ ...errFeedback }));
            break;
        }
      }
    }, 12000);
  });
}
