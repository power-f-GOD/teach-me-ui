import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  StatusPropsState,
  authState,
  signupState,
  signinState,
  signoutState,
  AuthState
} from '../../constants';
import { signin, signup, auth, signout } from '../../reducers/auth';

afterEach(cleanup);

it("auth reducers should be called with 'state' and 'action' params and return object of type StatusPropsState", () => {
  const mockSignState: StatusPropsState = {
    err: false,
    status: expect.stringMatching(/settled|pending|fulfilled/),
    statusText: expect.stringMatching(/.*/)
  };
  const mockAuthState: AuthState = {
    isAuthenticated: false,
    status: expect.stringMatching(/settled|pending|fulfilled/)
  };
  const action: ReduxAction = {
    type: 'AUTHENTICATE_USER',
    payload: { ...authState }
  };
  const signupMockFunc = jest.fn(
    (state: StatusPropsState, action: ReduxAction) => signup(state, action)
  );
  const signinMockFunc = jest.fn(
    (state: StatusPropsState, action: ReduxAction) => signin(state, action)
  );
  const authMockFunc = jest.fn((state: StatusPropsState, action: ReduxAction) =>
    auth(state, action)
  );
  const signoutMockFunc = jest.fn(
    (state: StatusPropsState, action: ReduxAction) => signout(state, action)
  );

  signupMockFunc(signupState, action);
  expect(signupMockFunc).toHaveBeenCalledWith(signupState, action);
  expect(signup(mockSignState, action)).toMatchObject(signupState);

  signinMockFunc(signinState, action);
  expect(signinMockFunc).toHaveBeenCalledWith(signinState, action);
  expect(signin(mockSignState, action)).toMatchObject(signinState);

  authMockFunc(authState, action);
  expect(authMockFunc).toHaveBeenCalledWith(authState, action);
  expect(auth(mockAuthState, action)).toMatchObject(authState);

  signoutMockFunc(signoutState, action);
  expect(signoutMockFunc).toHaveBeenCalledWith(signoutState, action);
  expect(signout(mockSignState, action)).toMatchObject(signoutState);
});
