import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  StatusPropsState,
  authState,
  signupState,
  signinState,
  signoutState,
  AuthState,
  AUTHENTICATE_USER,
  ForgotPasswordStatusState,
  forgotPasswordStatusState,
  FORGOT_PASSWORD_PENDING,
  FORGOT_PASSWORD_COMPLETED
} from '../../constants';
import {
  signin,
  signup,
  auth,
  signout,
  forgotPasswordStatus
} from '../../reducers/auth';

afterEach(cleanup);

it("forgotPasswordStatus reducer should be called with 'state' and 'action' and return object of type ForgotPasswordStatusState", () => {
  const mockForgotPasswordStatusState: ForgotPasswordStatusState = {
    status: expect.stringMatching(/completed|pending/)
  };

  const action: ReduxAction = {
    type: FORGOT_PASSWORD_COMPLETED
  };

  const forgotPasswordStatusMockFunc = jest.fn(
    (state: ForgotPasswordStatusState, action: ReduxAction) =>
      forgotPasswordStatus(state, action)
  );

  forgotPasswordStatusMockFunc(mockForgotPasswordStatusState, action);
  expect(forgotPasswordStatusMockFunc).toHaveBeenCalledWith(
    forgotPasswordStatusState,
    action
  );
  expect(
    forgotPasswordStatus(mockForgotPasswordStatusState, action)
  ).toMatchObject(forgotPasswordStatusState);
});

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
    type: AUTHENTICATE_USER,
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
