import {
  ReduxAction,
  NETWORK_STATUS_CHECK,
  DISPLAY_SNACK_BAR,
  SnackbarState
} from '../constants';

export const online = (newState: boolean): ReduxAction => {
  return {
    type: NETWORK_STATUS_CHECK,
    newState
  };
};

export const displaySnackbar = (payload: SnackbarState): ReduxAction => {
  return {
    type: DISPLAY_SNACK_BAR,
    payload
  };
};
