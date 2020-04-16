import {
  ReduxAction,
  DISPLAY_SNACK_BAR,
  SnackbarState
} from '../constants';

export const displaySnackbar = (payload: SnackbarState): ReduxAction => {
  return {
    type: DISPLAY_SNACK_BAR,
    payload
  };
};
