import { cleanup } from '@testing-library/react';

import {
  promisedDispatch,
  callNetworkStatusChecker,
  populateStateWithUserData,
  logError
} from '../../functions';
import { ReduxAction, UserData } from '../../constants';

afterEach(cleanup);

it('promisedDispatch dispatches an action which returns a promise that resolves with the action dispatched.', () => {
  let action: ReduxAction = {
    type: 'SIGNIN_USER'
  };
  expect(promisedDispatch(action)).resolves.toBe(action);
});

it("callNetworkStatusChecker should be called with 'signin' or 'signup' as param and return undefined.", () => {
  let mockFunc = jest.fn();
  callNetworkStatusChecker(mockFunc('signin', 'signup'));
  expect(mockFunc).toHaveBeenCalledWith('signin', 'signup');
  expect(callNetworkStatusChecker('signin')).toBeUndefined();
});

it("populateStateWithUserData should be called with 'user data' as param and return a promise which resolves with undefined.", () => {
  let userData: UserData = {
    firstname: 'John',
    lastname: 'Doe',
    displayName: 'John Doe',
    email: 'johndoe@gmail.com',
    username: 'johndoe',
    password: '********'
  };
  let mockFunc = jest.fn();
  populateStateWithUserData(mockFunc(userData) || userData);
  expect(mockFunc).toHaveBeenCalledWith(userData);
  expect(populateStateWithUserData(userData)).resolves.toBeUndefined();
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