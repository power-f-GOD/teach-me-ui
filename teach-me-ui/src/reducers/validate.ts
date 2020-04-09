import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  inputState,
  InputPropsState,
} from '../constants';

export const firstname = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === FIRSTNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || /\d+|\W+|_/.test(value);
    let helperText = err
      ? !value
        ? 'Firstname is required.'
        : "Ok. That can't be your firstname."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText,
    };
  }
  return state;
};

export const lastname = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === LASTNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || /\d+|\W+|_/.test(value);
    let helperText = err
      ? !value
        ? 'Firstname is required.'
        : "Ok. That can't be your firstname."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText,
    };
  }
  return state;
};

export const username = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === USERNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || /\d+|\W+/.test(value);
    let helperText = err
      ? !value
        ? 'Username is required.'
        : 'Username not accepted. Use letters (and underscores) only.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText,
    };
  }
  return state;
};

export const email = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === EMAIL_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || !/^\w+[\w\d.]*[\w\d]+@\w+\.[\w\d.]+[\w\d]$/.test(value);
    let helperText = err
      ? !value
        ? 'Email is required.'
        : "Hm. That doesn't seem like a valid email."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText,
    };
  }
  return state;
};

export const password = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === PASSWORD_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value;
    let helperText = err ? 'Password is required.' : ' ';

    if (!err && value.length < 8) {
      err = true;
      helperText = 'Password should not be less than 8 characters.';
    } else if (!err && /^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(value)) {
      err = true;
      helperText = 'Password is weak. Consider combining alphanumerics.';
    }

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText,
    };
  }
  return state;
};
