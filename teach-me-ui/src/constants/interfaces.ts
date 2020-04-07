import { StoreEnhancer } from 'redux';

export interface ReduxAction {
  type: string;
  newState?: any;
}

export interface AppProps extends StoreEnhancer {
  dispatch?: Function;
  [key: string]: any;
}

export interface SignupState {
  firstname: string;
  firstnameErr: boolean;
  firstnameHelperText: string;
  lastname: string;
  lastnameErr: boolean;
  lastnameHelperText: string;
  username: string;
  usernameErr: boolean;
  usernameHelperText: string;
  email: string;
  emailErr: boolean;
  emailHelperText: string;
  password: string;
  passwordErr: boolean;
  passwordHelperText: string;
  [key: string]: any;
}
