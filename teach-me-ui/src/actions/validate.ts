import axios from 'axios';

import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
  BasicInputState,
  SIGNIN_ID_VALIDATE,
  SIGNIN_PASSWORD_VALIDATE,
  DOB_VALIDATE,
  INSTITUTION_VALIDATE,
  DEPARTMENT_VALIDATE,
  LEVEL_VALIDATE,
  GET_MATCHING_INSTITUTIONS,
  POPULATE_MATCHING_INSTITUTIONS,
  SearchState,
  POPULATE_MATCHING_DEPARTMENTS,
  POPULATE_MATCHING_LEVELS,
  GET_MATCHING_DEPARTMENTS,
  GET_MATCHING_LEVELS,
  AcademicInputState
} from '../constants';
import { logError, getState } from '../functions';
import { signup } from './';

const endpointUrl = 'https://teach-me-services.herokuapp.com/api/v1';

export const validateFirstname = (payload: BasicInputState): ReduxAction => {
  return {
    type: FIRSTNAME_VALIDATE,
    payload
  };
};

export const validateLastname = (payload: BasicInputState): ReduxAction => {
  return {
    type: LASTNAME_VALIDATE,
    payload
  };
};

export const validateUsername = (payload: BasicInputState): ReduxAction => {
  return {
    type: USERNAME_VALIDATE,
    payload
  };
};

export const validateEmail = (payload: BasicInputState): ReduxAction => {
  return {
    type: EMAIL_VALIDATE,
    payload
  };
};

export const validateDob = (payload: BasicInputState): ReduxAction => {
  return {
    type: DOB_VALIDATE,
    payload: {
      ...payload,
      currentYear: new Date().getFullYear()
    }
  };
};

export const validatePassword = (payload: BasicInputState): ReduxAction => {
  return {
    type: PASSWORD_VALIDATE,
    payload
  };
};

export const validateInstitution = (
  payload: AcademicInputState
): ReduxAction => {
  return {
    type: INSTITUTION_VALIDATE,
    payload
  };
};

export const validateDepartment = (
  payload: AcademicInputState
): ReduxAction => {
  return {
    type: DEPARTMENT_VALIDATE,
    payload
  };
};

export const validateLevel = (payload: AcademicInputState): ReduxAction => {
  return {
    type: LEVEL_VALIDATE,
    payload
  };
};

export const validateSigninId = (payload: BasicInputState): ReduxAction => {
  return {
    type: SIGNIN_ID_VALIDATE,
    payload
  };
};

export const validateSigninPassword = (
  payload: BasicInputState
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
              matchingInstitutions({
                status: 'fulfilled',
                err: true,
                data: response.data.institutions,
                statusText: keyword
                  ? "Institution doesn't match our records."
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

export const matchingInstitutions = (payload: SearchState) => {
  return {
    type: POPULATE_MATCHING_INSTITUTIONS,
    payload
  };
};

//use this to delay search in case user types very fast to ensure the right results display
let departmentSearchTimeout: any = null;

export const getMatchingDepartments = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  const { institution } = getState();

  clearTimeout(departmentSearchTimeout);

  if (keyword) {
    departmentSearchTimeout = window.setTimeout(() => {
      axios({
        url: `${endpointUrl}/department/search?keyword=${keyword}&institution=${institution.value.uid}&limit=15`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: any) => {
          console.log('what is department response');
          if (!response.data.error && !!response.data.departments[0]) {
            dispatch(
              matchingDepartments({
                status: 'fulfilled',
                err: false,
                data: response.data.departments
              })
            );
          } else {
            dispatch(
              matchingDepartments({
                status: 'fulfilled',
                err: true,
                data: [],
                statusText: `Department doesn\'t match our records. ${
                  keyword.length > 2 ? "'Create' one?" : ''
                }`
              })
            );
          }
        })
        .catch(logError(signup));
    }, 200);
  } else {
    dispatch(matchingDepartments({ status: 'settled', data: [] }));
  }

  return {
    type: GET_MATCHING_DEPARTMENTS,
    newState: keyword
  };
};

export const matchingDepartments = (payload: SearchState) => {
  return {
    type: POPULATE_MATCHING_DEPARTMENTS,
    payload
  };
};

//use this to delay search in case user types very fast to ensure the right results display
let levelSearchTimeout: any = null;

export const getMatchingLevels = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  const { department } = getState();

  clearTimeout(levelSearchTimeout);

  if (keyword) {
    levelSearchTimeout = window.setTimeout(() => {
      axios({
        url: `${endpointUrl}/department/search?keyword=${keyword}&department=${department.value.uid}&limit=15`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: any) => {
          console.log('what is response for level: ', response);
          if (!response.data.error && !!response.data.levels[0]) {
            dispatch(
              matchingLevels({
                status: 'fulfilled',
                err: false,
                data: response.data.levels
              })
            );
          } else {
            dispatch(
              matchingLevels({
                status: 'fulfilled',
                err: true,
                data: []
              })
            );
          }
        })
        .catch(logError(signup));
    }, 200);
  } else {
    dispatch(matchingLevels({ status: 'settled', data: [] }));
  }

  return {
    type: GET_MATCHING_LEVELS,
    newState: keyword
  };
};

export const matchingLevels = (payload: SearchState) => {
  return {
    type: POPULATE_MATCHING_LEVELS,
    payload
  };
};
