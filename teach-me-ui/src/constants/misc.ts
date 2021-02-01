import {
  SnackbarState,
  SearchState,
  UserData,
  NotificationState,
  MentionState,
  ReplyState,
  UploadState,
  QuestionState,
  NotificationSoundState
} from '../types';

let useLiveUrl = true;
let live = 'teach-me-services.herokuapp.com';
let local = 'd1929a075f41.ngrok.io';

export const apiBaseURL = `https://${useLiveUrl ? live : local}/api/v1`;
export const wsBaseURL = `ws://${useLiveUrl ? live : local}/api/v1`;

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';

export const POPULATE_STATE_WITH_USER_DATA = 'POPULATE_STATE_WITH_USER_DATA';

export const INIT_WEB_SOCKET = 'INIT_WEB_SOCKET';
export const CLOSE_WEB_SOCKET = 'CLOSE_WEB_SOCKET';

export const PING_USER = 'PING_USER';

export const ONLINE_STATUS = 'ONLINE_STATUS';

export const TRIGGER_NOTIFICATION_SOUND = 'TRIGGER_NOTIFICATION_SOUND';
export const SET_WINDOW_WIDTH = 'SET_WINDOW_WIDTH';

export const PLACEHOLDER_BIO = "Hi, there! I'm awesome! I use Kanyimuta!";

export const TONE_TYPE__INCOMING_MESSAGE = 'INCOMING_MESSAGE';
export const TONE_TYPE__OUTGOING_MESSAGE = 'OUTGOING_MESSAGE';
export const TONE_TYPE__ACTION_SUCCESS = 'ACTION_SUCCESS';
export const TONE_TYPE__GENERAL = 'GENERAL';

export const TONE_NAME__EXQUISITE = 'exquisite-557';
export const TONE_NAME__PIECE_OF_CAKE = 'piece-of-cake-611';
export const TONE_NAME__QUITE_IMPRESSED = 'quite-impressed-565';
export const TONE_NAME__SLOW_SPRING_BOARD = 'slow-spring-board-570';
export const TONE_NAME__OPEN_ENDED = 'open-ended-563';
export const TONE_NAME__JUNTOS = 'juntos-607';
export const TONE_NAME__ALL_EYES_ON_ME = 'all-eyes-on-me-465';
export const TONE_NAME__SUPPRESSED = 'suppressed-437';
export const TONE_NAME__JUST_LIKE_THAT = 'just-like-that-404';

export const notificationSoundState: NotificationSoundState = {
  play: false,
  isPlaying: false,
  isReady: false,
  toneName: TONE_NAME__PIECE_OF_CAKE,
  toneType: TONE_TYPE__GENERAL,
  hasEnded: false
};

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
  }
};

export const mentionState: MentionState = {
  status: 'settled',
  err: false,
  data: []
};

export const userDataState: UserData = {
  avatar: 'avatar-1.png',
  displayName: '',
  first_name: '',
  last_name: '',
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

export const uploadState: UploadState = {
  status: 'settled',
  err: false,
  data: []
};

export const questionState: QuestionState = {
  status: 'settled',
  err: false
};
