import axios from 'axios';

import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  InputPropsState,
  SIGNIN_ID_VALIDATE,
  SIGNIN_PASSWORD_VALIDATE,
  DOB_VALIDATE,
  UNIVERSITY_VALIDATE,
  DEPARTMENT_VALIDATE,
  LEVEL_VALIDATE,
  GET_MATCHING_INSTITUTIONS,
  POPULATE_MATCHING_INSTITUTIONS,
  MatchingInstitutionsState
} from '../constants';
import { logError } from '../functions';
import { signup } from './';

export const validateFirstname = (payload: InputPropsState): ReduxAction => {
  return {
    type: FIRSTNAME_VALIDATE,
    payload
  };
};

export const validateLastname = (payload: InputPropsState): ReduxAction => {
  return {
    type: LASTNAME_VALIDATE,
    payload
  };
};

export const validateUsername = (payload: InputPropsState): ReduxAction => {
  return {
    type: USERNAME_VALIDATE,
    payload
  };
};

export const validateEmail = (payload: InputPropsState): ReduxAction => {
  return {
    type: EMAIL_VALIDATE,
    payload
  };
};

export const validateDob = (payload: InputPropsState): ReduxAction => {
  return {
    type: DOB_VALIDATE,
    payload: {
      ...payload,
      currentYear: new Date().getFullYear()
    }
  };
};

export const validatePassword = (payload: InputPropsState): ReduxAction => {
  return {
    type: PASSWORD_VALIDATE,
    payload
  };
};

export const validateUniversity = (
  payload: InputPropsState | any
): ReduxAction => {
  return {
    type: UNIVERSITY_VALIDATE,
    payload
  };
};

export const validateDepartment = (payload: InputPropsState): ReduxAction => {
  return {
    type: DEPARTMENT_VALIDATE,
    payload
  };
};

export const validateLevel = (payload: InputPropsState): ReduxAction => {
  return {
    type: LEVEL_VALIDATE,
    payload
  };
};

export const validateSigninId = (payload: InputPropsState): ReduxAction => {
  return {
    type: SIGNIN_ID_VALIDATE,
    payload
  };
};

export const validateSigninPassword = (
  payload: InputPropsState
): ReduxAction => {
  return {
    type: SIGNIN_PASSWORD_VALIDATE,
    payload
  };
};

//use this to delay search in case user types very fast to ensure the right results display
let institutionSearchTimeout: any = null;

export const getMatchingInstitutions = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  clearTimeout(institutionSearchTimeout);

  if (keyword) {
    dispatch(matchingInstitutions({ status: 'pending' }));

    institutionSearchTimeout = window.setTimeout(() => {
      axios({
        url: `https://teach-me-services.herokuapp.com/api/v1/institution/search?keyword=${keyword}&limit=15`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: any) => {
          if (!response.data.error && !!response.data.institutions[0]) {
            dispatch(
              matchingInstitutions({
                status: 'fulfilled',
                err: false,
                data: response.data.institutions
              })
            );
          } else {
            dispatch(
              validateUniversity({
                value: keyword,
                err: true,
                helperText: keyword
                  ? "University doesn't match our records."
                  : ' '
              })
            );
          }
        })
        .catch(logError(signup));
    }, 200);
  } else {
    dispatch(matchingInstitutions({ status: 'settled', data: [] }));
  }

  return {
    type: GET_MATCHING_INSTITUTIONS,
    newState: keyword
  };
};

export const matchingInstitutions = (payload: MatchingInstitutionsState) => {
  return {
    type: POPULATE_MATCHING_INSTITUTIONS,
    payload
  };
};
