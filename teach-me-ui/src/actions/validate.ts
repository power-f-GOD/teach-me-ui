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
  BIO_VALIDATE,
  InstitutionInputState
} from '../constants';
import {
  logError,
  getState,
  checkNetworkStatusWhilstPend,
  http
} from '../functions';

export const validateFirstname = (payload: BasicInputState): ReduxAction => {
  return {
    type: FIRSTNAME_VALIDATE,
    payload
  };
};

export const validateBio = (payload: BasicInputState): ReduxAction => {
  return {
    type: BIO_VALIDATE,
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
  payload: InstitutionInputState
): ReduxAction => {
  return {
    type: INSTITUTION_VALIDATE,
    payload
  };
};

export const validateDepartment = (payload: BasicInputState): ReduxAction => {
  return {
    type: DEPARTMENT_VALIDATE,
    payload
  };
};

export const validateLevel = (payload: BasicInputState): ReduxAction => {
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
  checkNetworkStatusWhilstPend({
    name: 'matchingInstitutions',
    func: matchingInstitutions
  });

  if (keyword) {
    dispatch(matchingInstitutions({ status: 'pending' }));

    institutionSearchTimeout = window.setTimeout(() => {
      http
        .get<any[]>(`/institution/search?keyword=${keyword.trim()}&limit=15`)
        .then(({ error, data: institutions }) => {
          if (!error && !!institutions[0]) {
            dispatch(
              matchingInstitutions({
                status: 'fulfilled',
                err: false,
                data: institutions
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
                data: institutions
              })
            );
          }
        })
        .catch(logError(matchingInstitutions));
    }, 250);
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

export const getMatchingDepartments = (
  keyword: string,
  isEditProfile: boolean = false
) => (dispatch: Function): ReduxAction => {
  const institution: InstitutionInputState = getState().institution;
  const {
    keyword: institutionName,
    uid: institutionUid
  } = institution.value as any;

  clearTimeout(departmentSearchTimeout);
  checkNetworkStatusWhilstPend({
    name: 'matchingDepartments',
    func: matchingDepartments
  });

  if (keyword) {
    departmentSearchTimeout = window.setTimeout(() => {
      if (!isEditProfile) {
        if (institutionUid) {
          dispatch(matchingDepartments({ status: 'pending' }));

          http
            .get<string[]>(
              `/department/search?keyword=${keyword.trim()}&institution=${institutionName}&limit=15`
            )
            .then(({ error, data: departments }) => {
              if (!error && !!departments[0]) {
                dispatch(
                  matchingDepartments({
                    status: 'fulfilled',
                    err: false,
                    data: departments
                  })
                );
              } else {
                dispatch(
                  matchingDepartments({
                    status: 'fulfilled',
                    err: true,
                    data: []
                  })
                );
              }
            })
            .catch(logError(matchingDepartments));
        } else {
          dispatch(
            validateDepartment({
              err: true,
              helperText: 'You need to select an institution from its dropdown.'
            })
          );
        }
      } else {
        dispatch(matchingDepartments({ status: 'pending' }));

        http
          .get<string[]>(
            `/department/search?keyword=${keyword.trim()}&department=${institutionName}&limit=15`
          )
          .then(({ error, data: departments }) => {
            if (!error && !!departments[0]) {
              dispatch(
                matchingDepartments({
                  status: 'fulfilled',
                  err: false,
                  data: departments
                })
              );
            } else {
              dispatch(
                matchingDepartments({
                  status: 'fulfilled',
                  err: true,
                  data: []
                })
              );
            }
          })
          .catch(logError(matchingDepartments));
      }
    }, 250);
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

export const getMatchingLevels = (
  keyword: string,
  isEditProfile: boolean = false
) => (dispatch: Function): ReduxAction => {
  const { institution, department } = getState();
  const [_institution, institutionUid, _department] = [
    institution.value?.keyword,
    institution.value?.uid,
    department.value
  ];

  clearTimeout(levelSearchTimeout);
  checkNetworkStatusWhilstPend({
    name: 'matchingLevels',
    func: matchingLevels
  });

  if (keyword) {
    levelSearchTimeout = window.setTimeout(() => {
      if (!isEditProfile) {
        if (_department && institutionUid) {
          dispatch(matchingLevels({ status: 'pending' }));

          http
            .get<string[]>(
              `/level/search?keyword=${keyword.trim()}&department=${_department}&institution=${_institution}&limit=15`
            )
            .then(({ error, data: levels }) => {
              if (!error && !!levels[0]) {
                dispatch(
                  matchingLevels({
                    status: 'fulfilled',
                    err: false,
                    data: levels
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
            .catch(logError(matchingLevels));
        } else {
          dispatch(
            validateLevel({
              err: true,
              helperText:
                'You need to select an institution and input a department.'
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
      } else {
        if (_department) {
          dispatch(matchingLevels({ status: 'pending' }));

          http
            .get<string[]>(
              `/level/search?keyword=${keyword.trim()}&department=${_department}&institution=${_institution}&limit=15`
            )
            .then(({ error, data: levels }) => {
              if (!error && !!levels[0]) {
                dispatch(
                  matchingLevels({
                    status: 'fulfilled',
                    err: false,
                    data: levels
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
            .catch(logError(matchingLevels));
        } else {
          dispatch(
            validateLevel({
              err: true,
              helperText: 'You need to select a department.'
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
      }
    }, 250);
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
