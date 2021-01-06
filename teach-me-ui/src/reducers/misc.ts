import {
  ReduxAction,
  snackbarState,
  SnackbarState,
  userDataState,
  UserData,
  DISPLAY_SNACK_BAR,
  SET_USER_DISPLAY_NAME,
  POPULATE_STATE_WITH_USER_DATA,
  INIT_WEB_SOCKET,
  notificationSoundState,
  TRIGGER_NOTIFICATION_SOUND,
  NotificationSoundState,
  ReduxActionV2
} from '../constants';

export const notificationSound = (
  state: NotificationSoundState = notificationSoundState,
  action: ReduxActionV2<NotificationSoundState>
): NotificationSoundState => {
  return action.type === TRIGGER_NOTIFICATION_SOUND
    ? { ...state, ...action.payload }
    : state;
};

export const snackbar = (
  state: SnackbarState = snackbarState,
  action: ReduxAction
): SnackbarState => {
  return action.type === DISPLAY_SNACK_BAR
    ? { ...state, autoHide: false, timeout: undefined, ...action.payload }
    : state;
};

export const displayName = (state: string = 'User', action: ReduxAction) => {
  if (action.type === SET_USER_DISPLAY_NAME) {
    return action.payload;
  }
  return state;
};

export const userData = (
  state: UserData = userDataState,
  action: ReduxAction
): SnackbarState => {
  return action.type === POPULATE_STATE_WITH_USER_DATA
    ? { ...state, ...action.payload }
    : state;
};

export const webSocket = (state: any = null, action: ReduxAction) => {
  if (action.type === INIT_WEB_SOCKET) {
    return action.payload;
  }
  return state;
};
