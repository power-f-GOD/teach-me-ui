import { SnackbarState, SearchState, UserData, NotificationState } from './interfaces';

export const apiBaseURL = 'https://teach-me-services.herokuapp.com/api/v1';

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';
export const POPULATE_STATE_WITH_USER_DATA = 'POPULATE_STATE_WITH_USER_DATA';

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
}

export const notificationState: NotificationState = {
  status: 'settled',
  err: false,
  data: []
};
