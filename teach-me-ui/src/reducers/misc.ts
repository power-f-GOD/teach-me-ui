import {
  NETWORK_STATUS_CHECK,
  ReduxAction,
  snackbarState,
  SnackbarState,
  DISPLAY_SNACK_BAR
} from '../constants';

export const online = (state: boolean = true, action: ReduxAction): boolean => {
  return action.type === NETWORK_STATUS_CHECK ? action.newState : state;
};

export const snackbar = (
  state: SnackbarState = snackbarState,
  action: ReduxAction
): SnackbarState => {
  return action.type === DISPLAY_SNACK_BAR
    ? { ...state, ...action.payload }
    : state;
};
