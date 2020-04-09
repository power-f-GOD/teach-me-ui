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
}
