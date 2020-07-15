import { SnackbarState, SearchState, UserData, NotificationState } from './interfaces';

export const apiBaseURL = 'https://teach-me-services.herokuapp.com/api/v1';
// export const apiBaseURL = 'http://d9b9e98ebbc3.ngrok.io/api/v1';
export const wsBaseURL = 'wss://teach-me-services.herokuapp.com/api/v1';
// export const wsBaseURL = 'ws://d9b9e98ebbc3.ngrok.io/api/v1';

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';
export const POPULATE_STATE_WITH_USER_DATA = 'POPULATE_STATE_WITH_USER_DATA';
export const INIT_WEB_SOCKET = 'INIT_WEB_SOCKET';
export const CLOSE_WEB_SOCKET = 'CLOSE_WEB_SOCKET';

export const snackbarState: SnackbarState = {
  open: false,
  message: ' ',
  severity: 'error',
  autoHide: false
};

export const searchState: SearchState = {
  status: 'settled',
  err: false,
  statusText: ' ',
  data: []
};

export const notificationState: NotificationState = {
  status: 'settled',
  err: false,
  data: []
};

export const userDataState: UserData = {
  avatar: 'avatar-1.png',
  displayName: '',
  firstname: '',
  lastname: '',
  username: '',
  email: '',
  dob: '',
  institution: '',
  department: '',
  level: '',
  id: '',
  token: ''
};
