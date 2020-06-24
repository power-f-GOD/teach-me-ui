import {
  ReduxAction,
  StatusPropsState,
  BasicInputState,
  UserData,
  NetworkAction
} from '../constants';
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

export const validateEmailFn = (email: string) =>
  !!email && /^\w+[\w\d.]*[\w\d]+@\w+\.[\w\d.]+[\w\d]$/.test(email);

export const validateResetPasswordFn = (password: string) => {
  const result: BasicInputState = {
    value: password,
    err: false,
    helperText: ''
  };
  if (!password || password.length < 8) {
    result.err = true;
    result.helperText = 'Password should not be less than 8 characters.';
  } else if (/^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(password)) {
    result.err = true;
    result.helperText =
      'Password weak. Consider combining alphanumerics/symbols.';
  }
  return result;
};

export function promisedDispatch(action: ReduxAction): Promise<ReduxAction> {
  dispatch(action);
  return new Promise((resolve: Function) => {
    setTimeout(() => resolve(action), 200);
  });
}

let timeoutToGiveFeedback: any;
let timeoutToAbortNetworkAction: any;
export function callNetworkStatusCheckerFor(action: NetworkAction) {
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
      'Something, probably, seems to be wrong with your data connection. Try contact your Service Provider.'
  };

  //if after 12 seconds of sending request there's no response, throw a network error feedback to user
  timeoutToGiveFeedback = setTimeout(() => {
    state = getState();

    if (!state[action.name])
      throw Error(
        `Dispatch function '${action.name}' does not exist in state. Did you forget to map to props.`
      );

    callTimeoutToAbortNetworkAction(action);
  }, 15000);

  function callTimeoutToAbortNetworkAction(action: NetworkAction) {
    if (navigator.onLine && state[action.name]?.status === 'pending') {
      dispatch(action.func({ ...errFeedback }));
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
        dispatch(action.func({ ...abortionFeedback }));
        dispatch(
          displaySnackbar({
            open: true,
            message: abortionFeedback.statusText,
            severity: 'error'
          })
        );
      }
    }, 15000);
  }
}

export async function populateStateWithUserData(
  data: UserData
): Promise<ReduxAction> {
  const {
    firstname,
    lastname,
    username,
    email,
    dob,
    // institution,
    // department,
    // level,
    displayName
  } = data;

  //using same action creators for validation to set state values as it was used
  await promisedDispatch(setDisplayName(displayName));
  dispatch(validateFirstname({ value: firstname }));
  dispatch(validateLastname({ value: lastname }));
  dispatch(validateUsername({ value: username }));
  dispatch(validateEmail({ value: email }));
  dispatch(validateDob({ value: dob }));
  dispatch(
    validateInstitution({
      value: { keyword: '', uid: '' },
      err: false,
      helperText: ''
    })
  );
  dispatch(
    validateDepartment({
      value: '',
      err: false,
      helperText: ''
    })
  );
  dispatch(
    validateLevel({
      value: '',
      err: false,
      helperText: ''
    })
  );
  dispatch(signin({ status: 'fulfilled', err: false }));
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
  console.error('An error occured: ', error);
};

export const timestampFormatter = (
  _timestamp?: string | number,
  withSeconds?: boolean
): string => {
  let timestamp = Number(_timestamp)
    ? new Date(String(_timestamp)).toLocaleTimeString()
    : _timestamp;

  if (timestamp && !Number(_timestamp)) {
    if (!/^\d\d:\d\d:\d\d$/.test(String(timestamp))) {
      console.error('Invalid timestamp format: ', timestamp);
      return String(timestamp);
    }
  } else {
    timestamp = new Date().toLocaleTimeString();
  }

  let [hour, minute, second] = String(timestamp).split(':');
  let hr = +hour;
  let amOrPm = '';

  if (hr > 11) {
    amOrPm = 'pm';
    hr = hr === 12 ? hr : hr - 12;
  } else {
    amOrPm = 'am';
    hr = hr === 0 ? 12 : hr;
  }

  hour = hr < 10 ? '0' + hr : '' + hr;

  return withSeconds
    ? `${hour}:${minute}:${second} ${amOrPm}`
    : `${hour}:${minute} ${amOrPm}`;
};

export const bigNumberFormat: Function = (number: number): string => {
  if (isNaN(number)) return `${number}`;

  if (number < 9999) {
    return `${number}`;
  }

  if (number < 1000000) {
    return `${Math.floor(number / 1000)}K`;
  }
  if (number < 10000000) {
    return `${(number / 1000000).toFixed(2)}M`;
  }

  if (number < 1000000000) {
    return `${Math.floor(number / 1000000)}M`;
  }

  if (number < 1000000000000) {
    return `${Math.floor(number / 1000000000)}B`;
  }

  return '1T+';
};
