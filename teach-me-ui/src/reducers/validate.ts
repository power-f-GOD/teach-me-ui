import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  inputState,
<<<<<<< HEAD
  InputPropsState
} from '../constants';

export const firstname = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === FIRSTNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
=======
  InputState,
} from '../constants';

export const firstname = (
  state: InputState = inputState,
  action: ReduxAction
) => {
  if (action.type === FIRSTNAME_VALIDATE) {
    let value = action.payload;
>>>>>>> Modify code base for signup validation et al.
    let err = !value || /\d+|\W+|_/.test(value);
    let helperText = err
      ? !value
        ? 'Firstname is required.'
        : "Ok. That can't be your firstname."
      : ' ';

<<<<<<< HEAD
    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
=======
    return {
      value,
      err,
      helperText,
>>>>>>> Modify code base for signup validation et al.
    };
  }
  return state;
};

export const lastname = (
<<<<<<< HEAD
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === LASTNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || /\d+|\W+|_/.test(value);
    let helperText = err
      ? !value
        ? 'Lastname is required.'
        : "Hm. Doesn't look like a lastname."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
=======
  state: InputState = inputState,
  action: ReduxAction
) => {
  if (action.type === LASTNAME_VALIDATE) {
    let value = action.payload;
    let err = !value || /\d+|\W+|_/.test(value);
    let helperText = err
      ? !value
        ? 'Firstname is required.'
        : "Ok. That can't be your firstname."
      : ' ';

    return {
      value,
      err,
      helperText,
>>>>>>> Modify code base for signup validation et al.
    };
  }
  return state;
};

export const username = (
<<<<<<< HEAD
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === USERNAME_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
=======
  state: InputState = inputState,
  action: ReduxAction
) => {
  if (action.type === USERNAME_VALIDATE) {
    let value = action.payload;
>>>>>>> Modify code base for signup validation et al.
    let err = !value || /\d+|\W+/.test(value);
    let helperText = err
      ? !value
        ? 'Username is required.'
        : 'Username not accepted. Use letters (and underscores) only.'
      : ' ';

<<<<<<< HEAD
    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
=======
    return {
      value,
      err,
      helperText,
>>>>>>> Modify code base for signup validation et al.
    };
  }
  return state;
};

<<<<<<< HEAD
export const email = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === EMAIL_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
=======
export const email = (state: InputState = inputState, action: ReduxAction) => {
  if (action.type === EMAIL_VALIDATE) {
    let value = action.payload;
>>>>>>> Modify code base for signup validation et al.
    let err = !value || !/^\w+[\w\d.]*[\w\d]+@\w+\.[\w\d.]+[\w\d]$/.test(value);
    let helperText = err
      ? !value
        ? 'Email is required.'
        : "Hm. That doesn't seem like a valid email."
      : ' ';

<<<<<<< HEAD
    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
=======
    return {
      value,
      err,
      helperText,
>>>>>>> Modify code base for signup validation et al.
    };
  }
  return state;
};

export const password = (
<<<<<<< HEAD
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === PASSWORD_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
=======
  state: InputState = inputState,
  action: ReduxAction
) => {
  if (action.type === PASSWORD_VALIDATE) {
    let value = action.payload;
>>>>>>> Modify code base for signup validation et al.
    let err = !value;
    let helperText = err ? 'Password is required.' : ' ';

    if (!err && value.length < 8) {
      err = true;
      helperText = 'Password should not be less than 8 characters.';
    } else if (!err && /^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(value)) {
      err = true;
      helperText = 'Password is weak. Consider combining alphanumerics.';
    }

<<<<<<< HEAD
    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
=======
    return {
      value,
      err,
      helperText,
>>>>>>> Modify code base for signup validation et al.
    };
  }
  return state;
};
