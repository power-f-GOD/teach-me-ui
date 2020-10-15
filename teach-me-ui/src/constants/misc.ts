import {
  SnackbarState,
  SearchState,
  UserData,
  NotificationState,
  MentionState,
  ReplyState,
  UploadState
} from './interfaces';

import { makeStyles } from '@material-ui/core/styles';

export const apiBaseURL = 'https://teach-me-services.herokuapp.com/api/v1';
// export const apiBaseURL = 'http://883fe0f3aa74.ngrok.io/api/v1';
export const wsBaseURL = 'wss://teach-me-services.herokuapp.com/api/v1';
// export const wsBaseURL = 'ws://6bba2f1001c5.ngrok.io/api/v1';

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';
export const POPULATE_STATE_WITH_USER_DATA = 'POPULATE_STATE_WITH_USER_DATA';
export const INIT_WEB_SOCKET = 'INIT_WEB_SOCKET';
export const CLOSE_WEB_SOCKET = 'CLOSE_WEB_SOCKET';
export const ONLINE_STATUS = 'ONLINE_STATUS';

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
  data: {
    notifications: [],
    entities: {}
  },
  fromPing: false
};

export const mentionState: MentionState = {
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
  date_of_birth: '',
  institution: '',
  department: '',
  level: '',
  id: '',
  token: ''
};

export const replyState: ReplyState = {
  status: 'settled',
  err: false,
  data: undefined
};

export const uploadState: UploadState ={
  status: 'settled',
  err: false,
  data: []
}

export const useStyles = makeStyles((theme: any) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  }
}));