import {
  ReduxAction,
  snackbarState,
  SnackbarState,
  DISPLAY_SNACK_BAR,
  SET_USER_DISPLAY_NAME
} from '../constants';

export const snackbar = (
  state: SnackbarState = snackbarState,
  action: ReduxAction
): SnackbarState => {
  return action.type === DISPLAY_SNACK_BAR
    ? { ...state, autoHide: false, ...action.payload }
    : state;
};

export const displayName = (state: string = 'User', action: ReduxAction) => {
  if (action.type === SET_USER_DISPLAY_NAME) {
    return action.payload;
  }
  return state;
};
