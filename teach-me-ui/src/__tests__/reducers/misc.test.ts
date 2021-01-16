import { cleanup } from '@testing-library/react';

import {
  snackbarState,
  DISPLAY_SNACK_BAR,
  SET_USER_DISPLAY_NAME
} from '../../constants';
import { ReduxAction, SnackbarState } from '../../types';
import { displayName, snackbar } from '../../reducers/misc';

afterEach(cleanup);

it("misc reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockSnackbarState: SnackbarState = {
    autoHide: expect.any(Boolean),
    message: expect.any(String),
    open: expect.any(Boolean),
    severity: expect.stringMatching(/success|error|info|warning/)
  };
  const snackbarAction: ReduxAction = {
    type: DISPLAY_SNACK_BAR,
    payload: { ...mockSnackbarState, open: true, message: 'Snackbar is open.' }
  };
  const snackbarMockFunc = jest.fn(
    (state: SnackbarState, action: ReduxAction) => snackbar(state, action)
  );

  const displayNameAction: ReduxAction = {
    type: SET_USER_DISPLAY_NAME,
    payload: 'John Doe'
  };
  const displayNameMockFunc = jest.fn((state: string, action: ReduxAction) =>
    displayName(state, action)
  );
  const mockDisplayNameState = expect.stringMatching(/User|^\w+\s\w+$/);

  snackbarMockFunc(snackbarState, snackbarAction);
  expect(snackbarMockFunc).toHaveBeenCalledWith(snackbarState, snackbarAction);
  expect(snackbar(snackbarState, snackbarAction)).toMatchObject(
    mockSnackbarState
  );

  displayNameMockFunc('User', displayNameAction);
  expect(displayNameMockFunc).toHaveBeenCalledWith('User', displayNameAction);
  expect(displayName(mockDisplayNameState, displayNameAction)).toMatch(
    /User|^\w+\s\w+$/
  );
});
