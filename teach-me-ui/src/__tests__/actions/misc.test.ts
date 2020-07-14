import { cleanup } from '@testing-library/react';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock';

import {
  ReduxAction,
  SnackbarState,
  DISPLAY_SNACK_BAR,
  SET_USER_DISPLAY_NAME
} from '../../constants';

import { displaySnackbar, setDisplayName } from '../../actions';

afterEach(cleanup);

it("creates displaySnackbar action and should be called with its 'state props' and return action", () => {
  const mockSnackbarState: SnackbarState = {
    open: expect.any(Boolean),
    message: expect.any(String),
    severity: expect.stringMatching(/success|error|info|danger/),
    autoHide: expect.any(Boolean)
  };
  const displaySnackbarAction: ReduxAction = {
    type: DISPLAY_SNACK_BAR,
    payload: {
      ...mockSnackbarState,
      open: true,
      message: 'Snackbar is currently open.'
    }
  };
  const displaySnackbarMockFunc = jest.fn((payload: SnackbarState) =>
    displaySnackbar(payload)
  );

  displaySnackbarMockFunc(mockSnackbarState);
  expect(displaySnackbarMockFunc).toHaveBeenCalledWith(mockSnackbarState);
  expect(displaySnackbar(mockSnackbarState)).toMatchObject(
    displaySnackbarAction
  );
});

it('creates setDisplayName action and should be called with a string and return action', () => {
  const mockDisplayName: string = 'John Doe';
  const setDisplayNameAction: ReduxAction = {
    type: SET_USER_DISPLAY_NAME,
    payload: expect.stringMatching(/User|^\w+\s\w+$/)
  };
  const displayNameMockFunc = jest.fn((payload: string) =>
    setDisplayName(payload)
  );

  displayNameMockFunc(mockDisplayName);
  expect(displayNameMockFunc).toHaveBeenCalledWith(mockDisplayName);
  expect(setDisplayName(mockDisplayName)).toMatchObject(setDisplayNameAction);
});
