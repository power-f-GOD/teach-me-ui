import { ReduxAction, StatusPropsState, UserData } from '../constants';
import store from '../appStore';
import {
  signin,
  auth,
  setDisplayName,
  validateEmail,
  validateUsername,
  validateLastname,
  validateFirstname,
  displaySnackbar,
  validateInstitution,
  validateDepartment,
  validateLevel,
  validateDob
} from '../actions';

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  dispatch(action);
  return new Promise((resolve: Function) => {
    setTimeout(() => resolve(action), 200);
  });
}

let timeoutToGiveFeedback: any;
let timeoutToAbortNetworkAction: any;
export function callNetworkStatusCheckerFor(action: Function) {
  //clear timeout in case it's already been initialized by multiple submit actions
  clearTimeout(timeoutToGiveFeedback);
  clearTimeout(timeoutToAbortNetworkAction);

  let state: any;
  const errFeedback: StatusPropsState = {
    status: 'pending',
    err: true,
    statusText: "Network is taking too long to respond. Sure you're connected?"
  };
  const abortionFeedback: StatusPropsState = {
    status: 'settled',
    err: true,
    statusText:
      'Something seems to be wrong with your data connection. Contact your Service Provider.'
  };

  //if after 12 seconds of sending request there's no response, throw a network error feedback to user
  timeoutToGiveFeedback = setTimeout(() => {
    state = getState();

    if (!state[action.name])
      throw Error(
        `Dispatch function '${action.name}' does not exist in state. Did you forget to map to props.`
      );

    callTimeoutToAbortNetworkAction(action);
  }, 12000);

  function callTimeoutToAbortNetworkAction(action: Function) {
    if (navigator.onLine && state[action.name]?.status === 'pending') {
      dispatch(action({ ...errFeedback }));
      dispatch(
        displaySnackbar({
          open: true,
          message: errFeedback.statusText,
          severity: 'error'
        })
      );
    }

    timeoutToAbortNetworkAction = setTimeout(() => {
      state = getState();

      if (navigator.onLine && state[action.name].status === 'pending') {
        dispatch(action({ ...abortionFeedback }));
        dispatch(
          displaySnackbar({
            open: true,
            message: abortionFeedback.statusText,
            severity: 'error'
          })
        );
      }
    }, 10000);
  }
}

export async function populateStateWithUserData(data: UserData) {
  const {
    firstname,
    lastname,
    username,
    email,
    dob,
    institution,
    department,
    level,
    displayName
  } = data;

  //using same action creators for validation to set state values as it was used
  await promisedDispatch(setDisplayName(displayName));
  dispatch(validateFirstname({ value: firstname }));
  dispatch(validateLastname({ value: lastname }));
  dispatch(validateUsername({ value: username }));
  dispatch(validateEmail({ value: email }));
  dispatch(validateDob({ value: dob }));
  dispatch(validateInstitution({ value: { keyword: institution } }));
  dispatch(validateDepartment({ value: { keyword: department } }));
  dispatch(validateLevel({ value: { keyword: level } }));
  dispatch(
    signin({
      status: 'fulfilled',
      err: false
    })
  );
  return promisedDispatch(auth({ status: 'fulfilled', isAuthenticated: true }));
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
      message: navigator.onLine
        ? `${message[0].toUpperCase()}${message.slice(1)}.`
        : 'You are offline.',
      severity: 'error'
    })
  );
  console.error('An error occured: ', message);
};
