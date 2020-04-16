import { SnackbarState } from './interfaces';

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';

export const snackbarState: SnackbarState = {
  open: false,
  message: ' ',
  severity: 'error',
  autoHide: false
};
