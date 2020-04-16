import {
  ReduxAction,
  snackbarState,
  SnackbarState,
  DISPLAY_SNACK_BAR
} from '../constants';

export const snackbar = (
  state: SnackbarState = snackbarState,
  action: ReduxAction
): SnackbarState => {
  return action.type === DISPLAY_SNACK_BAR
    ? { ...state, ...action.payload }
    : state;
};
