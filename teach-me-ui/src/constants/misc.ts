import { SnackbarState } from './interfaces';

export const NETWORK_STATUS_CHECK = 'NETWORK_STATUS_CHECK';
export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';

export const snackbarState: SnackbarState = {
  open: false,
  message: ' ',
  severity: 'error',
  autoHide: false
};
