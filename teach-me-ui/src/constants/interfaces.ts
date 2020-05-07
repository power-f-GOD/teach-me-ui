import { StoreEnhancer } from 'redux';

export interface ReduxAction {
  type: string;
  newState?: any;
  payload?: any;
}

export interface AppProps extends StoreEnhancer {
  dispatch?: Function;
  [key: string]: any;
}

export interface InputPropsState {
  value: string;
  err?: boolean;
  helperText?: string;
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

export interface MatchingInstitutionsState extends StatusPropsState {
  data?: any[]
}

export interface SignupPropsState {
  firstname: InputPropsState;
  lastname: InputPropsState;
  username: InputPropsState;
  email: InputPropsState;
  dob: InputPropsState;
  password: InputPropsState;
  university: InputPropsState;
  department: InputPropsState;
  level: InputPropsState;
  matchingInstitutions?: MatchingInstitutionsState
  [key: string]: any;
}

export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  dob: string;
  password?: string;
  university: string;
  department: string;
  level: string;
}

export interface SigninPropsState {
  signinId: InputPropsState;
  signinPassword: InputPropsState;
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


