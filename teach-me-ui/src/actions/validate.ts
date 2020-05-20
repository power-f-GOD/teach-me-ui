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
  AcademicInputState,
  CreateDepartmentState,
  createDepartmentState,
  REQUEST_CREATE_DEPARTMENT,
  CREATE_DEPARTMENT,
  REQUEST_CREATE_LEVEL,
  CREATE_LEVEL,
  CreateLevelState,
  createLevelState
} from '../constants';
import { logError, getState, callNetworkStatusCheckerFor } from '../functions';
import { signup, displaySnackbar } from './';

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
  dispatch(matchingInstitutions({ status: 'pending', data: [] }));

  if (keyword) {
    institutionSearchTimeout = window.setTimeout(() => {
      axios({
        url: `${endpointUrl}/institution/search?keyword=${keyword}&limit=15`,
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
              validateInstitution({
                err: true,
                helperText: "Institution doesn't match our records."
              })
            );
            dispatch(
              matchingInstitutions({
                status: 'fulfilled',
                err: true,
                data: response.data.institutions
              })
            );
          }
        })
        .catch(logError(signup));
    }, 100);
  } else {
    dispatch(matchingInstitutions({ status: 'settled', err: true, data: [] }));
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
  const institutionUid = getState().institution.value?.uid;

  clearTimeout(departmentSearchTimeout);
  dispatch(matchingDepartments({ status: 'pending', data: [] }));

  if (keyword) {
    departmentSearchTimeout = window.setTimeout(() => {
      if (institutionUid) {
        axios({
          url: `${endpointUrl}/department/search?keyword=${keyword}&institution=${institutionUid}&limit=15`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then((response: any) => {
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
                validateDepartment({
                  err: true,
                  helperText: `Department doesn't match our records. ${
                    keyword.length > 2 ? "'Create' one?" : ''
                  }`
                })
              );
              dispatch(
                matchingDepartments({
                  status: 'fulfilled',
                  err: true,
                  data: []
                })
              );
            }
          })
          .catch(logError(signup));
      } else {
        dispatch(
          validateDepartment({
            err: true,
            helperText: 'You need to select an institution first.'
          })
        );
        dispatch(
          matchingDepartments({
            status: 'settled',
            err: true,
            data: []
          })
        );
      }
    }, 100);
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

export const requestCreateDepartment = (
  payload: CreateDepartmentState = createDepartmentState
) => (dispatch: Function): ReduxAction => {
  const { department, institution } = payload;

  dispatch(createDepartment({ status: 'pending' }));
  callNetworkStatusCheckerFor(createDepartment);

  if (department && institution) {
    axios({
      url: '/department/create',
      method: 'POST',
      baseURL: endpointUrl,
      data: {
        department,
        institution
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response: any) => {
        if (!response.data.error && !!response.data.id) {
          dispatch(
            createDepartment({
              status: 'fulfilled',
              err: false
            })
          );
          dispatch(
            validateDepartment({
              value: {
                keyword: department,
                uid: response.data.id
              },
              err: false
            })
          );
          dispatch(
            displaySnackbar({
              autoHide: true,
              severity: 'success',
              open: true,
              message: 'Department created.'
            })
          );
        } else {
          dispatch(
            createDepartment({
              status: 'fulfilled',
              err: true
            })
          );
        }
      })
      .catch(logError(signup));
  } else {
    dispatch(
      createDepartment({
        status: 'settled',
        err: true
      })
    );
    dispatch(
      displaySnackbar({
        open: true,
        message: 'Could not create Department. Did you select an Institution?',
        severity: 'error'
      })
    );
  }

  return {
    type: REQUEST_CREATE_DEPARTMENT,
    payload
  };
};

export const createDepartment = (
  payload: CreateDepartmentState = createDepartmentState
) => {
  return {
    type: CREATE_DEPARTMENT,
    payload
  };
};

//use this to delay search in case user types very fast to ensure the right results display
let levelSearchTimeout: any = null;

export const getMatchingLevels = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  const departmentUid = getState().department.value?.uid;

  clearTimeout(levelSearchTimeout);
  dispatch(matchingLevels({ status: 'pending', data: [] }));

  if (keyword) {
    levelSearchTimeout = window.setTimeout(() => {
      if (departmentUid) {
        axios({
          url: `${endpointUrl}/level/search?keyword=${keyword}&department=${departmentUid}&limit=15`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then((response: any) => {
            console.log('Response from level search:', response.data);
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
                validateLevel({
                  err: true,
                  helperText: `Level doesn't match our records. ${
                    keyword.length > 2 ? "'Create' one?" : ''
                  }`
                })
              );
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
      } else {
        dispatch(
          validateLevel({
            err: true,
            helperText: 'You need to select a department first.'
          })
        );
        dispatch(
          matchingLevels({
            status: 'settled',
            err: true,
            data: []
          })
        );
      }
    }, 100);
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

export const requestCreateLevel = (
  payload: CreateLevelState = createLevelState
) => (dispatch: Function): ReduxAction => {
  const { level, department } = payload;

  dispatch(createLevel({ status: 'pending' }));
  callNetworkStatusCheckerFor(createLevel);

  if (level && department) {
    axios({
      url: '/level/create',
      method: 'POST',
      baseURL: endpointUrl,
      data: {
        level,
        department
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response: any) => {
        console.log('Response from createLevel', response.data);
        if (!response.data.error && !!response.data.id) {
          dispatch(
            createLevel({
              status: 'fulfilled',
              err: false
            })
          );
          dispatch(
            validateLevel({
              value: {
                keyword: level,
                uid: response.data.id
              },
              err: false
            })
          );
          dispatch(
            displaySnackbar({
              open: true,
              message: 'Level created.',
              severity: 'success',
              autoHide: true
            })
          );
        } else {
          dispatch(
            createLevel({
              status: 'fulfilled',
              err: true
            })
          );
        }
      })
      .catch(logError(signup));
  } else {
    dispatch(
      createLevel({
        status: 'settled',
        err: true
      })
    );
    dispatch(
      displaySnackbar({
        open: true,
        message: 'Could not create Level. Did you select a Department?',
        severity: 'error'
      })
    );
  }

  return {
    type: REQUEST_CREATE_LEVEL,
    payload
  };
};

export const createLevel = (payload: CreateLevelState = createLevelState) => {
  return {
    type: CREATE_LEVEL,
    payload
  };
};
