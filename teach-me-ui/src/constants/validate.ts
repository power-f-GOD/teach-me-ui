import {
  SignupPropsState,
  BasicInputState,
  SigninPropsState,
  AcademicInputState,
  InputErrState,
  SearchState,
  CreateDepartmentState,
  CreateLevelState
} from './interfaces';

export const FIRSTNAME_VALIDATE = 'FIRSTNAME_VALIDATE';
export const LASTNAME_VALIDATE = 'LASTNAME_VALIDATE';
export const USERNAME_VALIDATE = 'USERNAME_VALIDATE';
export const EMAIL_VALIDATE = 'EMAIL_VALIDATE';
export const DOB_VALIDATE = 'DOB_VALIDATE';
export const PASSWORD_VALIDATE = 'PASSWORD_VALIDATE';
export const INSTITUTION_VALIDATE = 'INSTITUTION_VALIDATE';
export const DEPARTMENT_VALIDATE = 'DEPARTMENT_VALIDATE';
export const LEVEL_VALIDATE = 'LEVEL_VALIDATE';

export const GET_MATCHING_INSTITUTIONS = 'GET_MATCHING_INSTITUTIONS';
export const POPULATE_MATCHING_INSTITUTIONS = 'POPULATE_MATCHING_INSTITUTIONS';
export const GET_MATCHING_DEPARTMENTS = 'GET_MATCHING_DEPARTMENTS';
export const POPULATE_MATCHING_DEPARTMENTS = 'POPULATE_MATCHING_DEPARTMENTS';
export const GET_MATCHING_LEVELS = 'GET_MATCHING_LEVELS';
export const POPULATE_MATCHING_LEVELS = 'POPULATE_MATCHING_LEVELS';
export const REQUEST_CREATE_DEPARTMENT = 'REQUEST_CREATE_DEPARTMENT';
export const CREATE_DEPARTMENT = 'CREATE_DEPARTMENT';
export const REQUEST_CREATE_LEVEL = 'REQUEST_CREATE_LEVEL';
export const CREATE_LEVEL = 'CREATE_LEVEL';

export const SIGNIN_ID_VALIDATE = 'SIGNIN_ID_VALIDATE';
export const SIGNIN_PASSWORD_VALIDATE = 'SIGNIN_PASSWORD_VALIDATE';

export const inputErrState: InputErrState = {
  err: false,
  helperText: ' '
};

export const basicInputState: BasicInputState = {
  value: '',
  ...inputErrState
};

export const academicInputState: AcademicInputState = {
  value: { keyword: '', uid: '' },
  ...inputErrState
};

export const searchState: SearchState = {
  status: 'settled',
  err: false,
  statusText: ' ',
  data: []
};

export const createDepartmentState: CreateDepartmentState = {
  department: '',
  university: '',
  uid: ''
};

export const createLevelState: CreateLevelState = {
  level: '',
  department: '',
  uid: ''
};

export const signupProps: SignupPropsState = {
  firstname: { ...basicInputState },
  lastname: { ...basicInputState },
  username: { ...basicInputState },
  email: { ...basicInputState },
  dob: { ...basicInputState },
  password: { ...basicInputState },
  institution: { ...academicInputState },
  department: { ...academicInputState },
  level: { ...academicInputState },
  matchingInstitutions: { ...searchState },
  matchingDepartments: { ...searchState },
  matchingLevels: { ...searchState }
};

export const signinProps: SigninPropsState = {
  signinId: { ...basicInputState },
  signinPassword: { ...basicInputState }
};
