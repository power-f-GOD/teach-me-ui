import produce from 'immer';

import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  basicInputState,
  academicInputState,
  BasicInputState,
  SIGNIN_ID_VALIDATE,
  SIGNIN_PASSWORD_VALIDATE,
  DOB_VALIDATE,
  INSTITUTION_VALIDATE,
  LEVEL_VALIDATE,
  DEPARTMENT_VALIDATE,
  POPULATE_MATCHING_INSTITUTIONS,
  SearchState,
  statusPropsState,
  AcademicInputState,
  POPULATE_MATCHING_LEVELS,
  POPULATE_MATCHING_DEPARTMENTS,
  CreateDepartmentState,
  createDepartmentState,
  CREATE_DEPARTMENT,
  CreateLevelState,
  createLevelState,
  CREATE_LEVEL
} from '../constants';

export const firstname = (
  state: BasicInputState = basicInputState,
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
  state: BasicInputState = basicInputState,
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
  state: BasicInputState = basicInputState,
  action: ReduxAction
) => {
  if (action.type === USERNAME_VALIDATE) {
    let { payload } = action;
    let value = payload.value || state.value;
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
  state: BasicInputState = basicInputState,
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
  state: BasicInputState = basicInputState,
  action: ReduxAction
) => {
  if (action.type === DOB_VALIDATE) {
    let { payload } = action;
    let [value, { currentYear }] = [payload.value || state.value, payload];
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
          ? 'Hmm. Not so fast. Underaged?'
          : 'Invalid D.O.B format or input.';
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
  state: BasicInputState = basicInputState,
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
      helperText = 'Password weak. Consider combining alphanumerics/symbols.';
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

export const institution = (
  state: AcademicInputState = academicInputState,
  action: ReduxAction
): AcademicInputState => {
  if (action.type === INSTITUTION_VALIDATE) {
    let { payload } = action;
    let val = payload.value || state.value;
    let value = val.keyword;
    let err = !value;
    let helperText = err
      ? !value
        ? 'Institution required.'
        : "Institution doesn't match our records."
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return (produce({ ...state, ...payload }, (draft: AcademicInputState) => {
      draft.value!.keyword = value;
      draft.err = err;
      draft.helperText = helperText;
    }) as unknown) as AcademicInputState;
  }

  return state;
};

export const matchingInstitutions = (
  state: SearchState = { ...statusPropsState, data: [] },
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

export const department = (
  state: AcademicInputState = academicInputState,
  action: ReduxAction
): AcademicInputState => {
  if (action.type === DEPARTMENT_VALIDATE) {
    let { payload } = action;
    let val = payload.value || state.value;
    let value = val.keyword;
    let err = !value || !/^[a-z,\s]+$/i.test(value);
    let helperText = err
      ? !value
        ? 'Department/Course of study required.'
        : 'Invalid input.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return (produce({ ...state, ...payload }, (draft: AcademicInputState) => {
      draft.value!.keyword = value;
      draft.err = err;
      draft.helperText = helperText;
    }) as unknown) as AcademicInputState;
  }

  return state;
};

export const matchingDepartments = (
  state: SearchState = { ...statusPropsState, data: [] },
  action: ReduxAction
) => {
  if (action.type === POPULATE_MATCHING_DEPARTMENTS) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const createDepartment = (
  state: CreateDepartmentState = createDepartmentState,
  action: ReduxAction
) => {
  if (action.type === CREATE_DEPARTMENT) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const level = (
  state: AcademicInputState = academicInputState,
  action: ReduxAction
): AcademicInputState => {
  if (action.type === LEVEL_VALIDATE) {
    let { payload } = action;
    let val = payload.value || state.value;
    let value = val.keyword;
    let err = !value || !/^([a-z0-9\s?]+)$/i.test(value);
    let helperText = err
      ? !value
        ? 'Level of study required.'
        : 'Input not accepted.'
      : ' ';

    err = 'err' in payload ? payload.err : err;
    helperText = 'helperText' in payload ? payload.helperText : helperText;

    return (produce({ ...state, ...payload }, (draft: AcademicInputState) => {
      draft.value!.keyword = value;
      draft.err = err;
      draft.helperText = helperText;
    }) as unknown) as AcademicInputState;
  }

  return state;
};

export const matchingLevels = (
  state: SearchState = { ...statusPropsState, data: [] },
  action: ReduxAction
) => {
  if (action.type === POPULATE_MATCHING_LEVELS) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const createLevel = (
  state: CreateLevelState = createLevelState,
  action: ReduxAction
) => {
  if (action.type === CREATE_LEVEL) {
    return {
      ...state,
      ...action.payload
    };
  }

  return state;
};

export const signinId = (
  state: BasicInputState = basicInputState,
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
  state: BasicInputState = basicInputState,
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
