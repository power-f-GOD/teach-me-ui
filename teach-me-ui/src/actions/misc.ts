import {
  ReduxAction,
  DISPLAY_SNACK_BAR,
  SnackbarState,
  SET_USER_DISPLAY_NAME
} from '../constants';

export const displaySnackbar = (payload: SnackbarState): ReduxAction => {
  return {
    type: DISPLAY_SNACK_BAR,
    payload
  };
};

export function setDisplayName(payload: string): ReduxAction {
  return {
    type: SET_USER_DISPLAY_NAME,
    payload
  };
}