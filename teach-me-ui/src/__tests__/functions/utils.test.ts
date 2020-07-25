import { cleanup } from '@testing-library/react';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock.ts';

import {
  promisedDispatch,
  populateStateWithUserData,
  bigNumberFormat,
  logError,
  handleForgotPasswordRequest,
  handleResetPasswordRequest,
  validateEmailFn,
  validateResetPasswordFn
} from '../../functions';
import { ReduxAction, UserData } from '../../constants';

afterEach(cleanup);

it('vaildateEmailFn is called with email and resolves to an action', () => {
  expect(validateEmailFn('')).toBe(false);
  expect(validateEmailFn('support@kanyimuta.com')).toBe(true);
});

it('handleForgotPasswordRequest is called with email and resolves to an action', () => {
  expect(handleForgotPasswordRequest(expect.any(String))).toBe(undefined);
});

it('handleResetPasswordRequest is called with password, token and callback and resolves to an action', () => {
  expect(
    handleResetPasswordRequest(
      expect.any(String),
      expect.any(String),
      expect.any(Function)
    )
  ).toBe(undefined);
});

it('promisedDispatch dispatches an action which returns a promise that resolves with the action dispatched.', () => {
  let action: ReduxAction = {
    type: 'SIGNIN_USER'
  };
  expect(promisedDispatch(action)).resolves.toBe(action);
});

it('[bigNumberFormat] should correctly format large and small numbers.', () => {
  expect(bigNumberFormat(20000)).toBe('20K');
  expect(bigNumberFormat(21500)).toBe('21K');
  expect(bigNumberFormat(2000)).toBe('2000');
  expect(bigNumberFormat(2254000)).toBe('2.25M');
  expect(bigNumberFormat(22345130)).toBe('22M');
  expect(bigNumberFormat(2130000000)).toBe('2B');
  expect(bigNumberFormat(2130000000000)).toBe('1T+');
});

// it("callNetworkStatusChecker should be called with 'signin' or 'signup' as param and return undefined.", () => {
//   let mockFunc = jest.fn();
//   callNetworkStatusCheckerFor(mockFunc(signin, signup));
//   expect(mockFunc).toHaveBeenCalledWith(signin, signup);
//   expect(callNetworkStatusCheckerFor(signin)).toBeUndefined();
// });

it("populateStateWithUserData should be called with 'user data' as param and return a promise which resolves with undefined.", () => {
  let action: ReduxAction = {
    type: 'POPULATE_STATE_WITH_USER_DATA'
  };
  let userData: UserData = {
    firstname: 'John',
    lastname: 'Doe',
    displayName: 'John Doe',
    email: 'johndoe@gmail.com',
    username: 'johndoe',
    dob: '12/12/2000',
    institution: 'UNN',
    department: 'COS',
    level: '100',
    id: '3fj9g0394ldg-sdf',
    token: '5kkl30k3485k'
  };
  let mockFunc = jest.fn();
  populateStateWithUserData(mockFunc(userData) || userData);
  expect(mockFunc).toHaveBeenCalledWith(userData);
  expect(populateStateWithUserData(userData)).resolves.toMatchObject(action);
});

it("logError should be called with an 'action' as param and return undefined.", () => {
  let action = (): ReduxAction => ({
    type: 'SIGNIN_USER'
  });
  let error = { message: 'A sample error occurred.' };
  let mockFunc = jest.fn();

  logError(mockFunc(action) || action)(mockFunc(error) || error);
  expect(mockFunc).toHaveBeenCalledWith(action);
  expect(mockFunc).toHaveBeenCalledWith(error);
  expect(logError(action)(error)).toBeUndefined();
});
