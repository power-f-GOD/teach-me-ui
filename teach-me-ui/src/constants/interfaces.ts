export interface ReduxAction {
  type: string;
  newState?: any;
  payload?: any;
}

// Auth [Signin/Signup] interfaces ...

export interface InputErrState {
  err?: boolean;
  helperText?: string;
}

export interface BasicInputState extends InputErrState {
  value?: string;
}

export interface AcademicInputState extends InputErrState {
  value?: { keyword?: string; uid?: string };
}

export interface AuthState {
  isAuthenticated?: boolean;
  status?: 'settled' | 'pending' | 'fulfilled';
}

export interface StatusPropsState {
  status?: 'settled' | 'pending' | 'fulfilled';
  err?: boolean;
  statusText?: string;
}

export interface SearchState extends StatusPropsState {
  data?: any[];
}

export interface SignupPropsState {
  firstname: BasicInputState;
  lastname: BasicInputState;
  username: BasicInputState;
  email: BasicInputState;
  dob: BasicInputState;
  password: BasicInputState;
  institution: AcademicInputState;
  department: AcademicInputState;
  level: AcademicInputState;
  matchingInstitutions: SearchState;
  matchingDepartments: SearchState;
  matchingLevels: SearchState;
  [key: string]: any;
}

export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  dob: string;
  password?: string;
  institution: string;
  department: string;
  level: string;
}

export interface SigninPropsState {
  signinId: BasicInputState;
  signinPassword: BasicInputState;
  [key: string]: any;
}

export interface SigninFormData {
  id: string;
  password: string;
}

export interface SnackbarState {
  open?: boolean;
  message?: string;
  severity?: 'error' | 'info' | 'success' | 'warning';
  autoHide?: boolean;
}

export interface UserData extends SignupFormData {
  displayName: string;
}

export interface CreateDepartmentState extends StatusPropsState {
  department?: string;
  institution?: string;
}

export interface CreateLevelState extends StatusPropsState {
  level?: string;
  department?: string;
}

// ChatBox interfaces...

export interface Chat {
  name?: string;
  type?: 'conversation' | 'classroom';
  avatar?: string;
  id?: string;
  queryString?: string;
  isOpen?: boolean;
  isMinimized?: boolean;
}

export interface Message {
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp: string;
}
