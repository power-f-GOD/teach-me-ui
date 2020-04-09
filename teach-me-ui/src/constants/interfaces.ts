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

export interface SignupState {
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
  signup: SignupState;
  [key: string]: any;
}

export interface SignupFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}