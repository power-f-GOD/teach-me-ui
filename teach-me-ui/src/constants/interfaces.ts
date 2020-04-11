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

<<<<<<< HEAD
export interface InputPropsState {
  value: string;
  err?: boolean;
  helperText?: string;
}

export interface AuthPropsState {
  status?: 'settled' | 'pending' | 'fulfilled';
  err?: boolean;
  success?: boolean;
  statusMsg?: string;
}

export interface SignupPropsState {
  firstname: InputPropsState;
  lastname: InputPropsState;
  username: InputPropsState;
  email: InputPropsState;
  password: InputPropsState;
  [key: string]: any;
}

export interface SigninPropsState {
  username: InputPropsState;
  email: InputPropsState;
  password: InputPropsState;
  [key: string]: any;
}

export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
=======
export interface InputState {
  value: string;
  err: boolean;
  helperText: string;
}

export interface SignupState {
  firstname: InputState;
  lastname: InputState;
  username: InputState;
  email: InputState;
  password: InputState;
  [key: string]: any;
>>>>>>> Modify code base for signup validation et al.
}

export interface SigninFormData {
  signinId: string;
  signinPassword: string;
}
