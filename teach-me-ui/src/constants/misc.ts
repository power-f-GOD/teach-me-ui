import { SnackbarState } from './interfaces';

export const apiBaseURL = 'https://teach-me-services.herokuapp.com/api/v1';

export const DISPLAY_SNACK_BAR = 'DISPLAY_SNACK_BAR';

export const snackbarState: SnackbarState = {
  open: false,
  message: ' ',
  severity: 'error',
  autoHide: false
};
