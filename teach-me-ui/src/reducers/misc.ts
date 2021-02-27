import {
  snackbarState,
  userDataState,
  DISPLAY_SNACK_BAR,
  SET_USER_DISPLAY_NAME,
  POPULATE_STATE_WITH_USER_DATA,
  INIT_WEB_SOCKET,
  notificationSoundState,
  TRIGGER_NOTIFICATION_SOUND,
  SET_WINDOW_WIDTH,
  DISPLAY_GALLERY
} from '../constants';
import {
  ReduxAction,
  UserData,
  SnackbarState,
  NotificationSoundState,
  ReduxActionV2,
  GalleryProps
} from '../types';

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

export const gallery = (
  state: GalleryProps = { open: false, data: [] },
  action: ReduxActionV2<GalleryProps>
): GalleryProps => {
  if (action.type === DISPLAY_GALLERY) {
    return { ...state, hasExtra: true, ...action.payload };
  }

  return state;
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

export const windowWidth = (
  state: number = 0,
  action: ReduxActionV2<number>
) => {
  if (action.type === SET_WINDOW_WIDTH) {
    return action.payload;
  }

  return state;
};
