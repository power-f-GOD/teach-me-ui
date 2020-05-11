import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  inputState,
  InputPropsState,
  SIGNIN_ID_VALIDATE,
  SIGNIN_PASSWORD_VALIDATE,
  DOB_VALIDATE,
  UNIVERSITY_VALIDATE,
  LEVEL_VALIDATE,
  DEPARTMENT_VALIDATE,
  POPULATE_MATCHING_INSTITUTIONS,
  MatchingInstitutionsState,
  statusPropsState
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
        ? 'Firstname required.'
        : "Doesn't look like a firstname."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
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
        ? 'Lastname required.'
        : 'Your lastname?'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
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
        ? 'Username required.'
        : 'Username not accepted. Use letters, underscores only.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
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
        ? 'Email required.'
        : "Ok. That doesn't seem like a valid email yet."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }
  return state;
};

export const dob = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === DOB_VALIDATE) {
    let { payload } = action;
    let { value, currentYear } = payload;
    let [day, month, year] = value?.split('/') ?? [0, 0, 0];
    let err = !value || !/^\d{2,2}\/\d{2,2}\/\d{4,4}$/.test(value);
    let helperText = !value ? 'Date of birth required.' : ' ';

    if (
      (+day > 31 ||
        +day < 1 ||
        +month > 12 ||
        +month < 1 ||
        +year > currentYear - 12 ||
        +year < 1900 ||
        err) &&
      value
    ) {
      err = true;
      helperText =
        +year > currentYear - 12
          ? "Hmm. Not so fast. Underaged?"
          : 'Invalid D.O.B pattern or input.';
    }

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
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
    let helperText = err ? 'Password required.' : ' ';

    if (!err && value.length < 8) {
      err = true;
      helperText = 'Password should not be less than 8 characters.';
    } else if (!err && /^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(value)) {
      err = true;
      helperText =
        'Password is weak. Consider combining alphanumerics/symbols.';
    }

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }
  return state;
};

export const university = (
  state: InputPropsState | any = { ...inputState, uid: '' },
  action: ReduxAction
) => {
  if (action.type === UNIVERSITY_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || !/^[a-z,\s]+$/i.test(value);
    let helperText = err
      ? !value
        ? 'University required.'
        : "University doesn't match our records."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      ...state,
      ...payload,
      value,
      err,
      helperText
    };
  }

  return state;
};

export const department = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === DEPARTMENT_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || !/^[a-z,\s]+$/i.test(value);
    let helperText = err
      ? !value
        ? 'Department/Course of study required.'
        : 'Invalid input.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }

  return state;
};

export const level = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === LEVEL_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value || !/^(1|2|3|4|5|6|7|8|9)00$/.test(value);
    let helperText = err
      ? !value
        ? 'Level of study required.'
        : 'Invalid university level.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }

  return state;
};

export const signinId = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === SIGNIN_ID_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value;
    let helperText = err ? 'Enter username or email.' : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }
  return state;
};

export const signinPassword = (
  state: InputPropsState = inputState,
  action: ReduxAction
) => {
  if (action.type === SIGNIN_PASSWORD_VALIDATE) {
    let { payload } = action;
    let { value } = payload;
    let err = !value;
    let helperText = err ? 'Enter password.' : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return {
      value,
      err,
      helperText
    };
  }
  return state;
};

export const matchingInstitutions = (
  state: MatchingInstitutionsState = { ...statusPropsState, data: [] },
  action: ReduxAction
) => {
  if (action.type === POPULATE_MATCHING_INSTITUTIONS) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
