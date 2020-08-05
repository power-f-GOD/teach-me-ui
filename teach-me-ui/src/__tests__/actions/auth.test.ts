import { cleanup } from '@testing-library/react';


import {
  ReduxAction,
  SignupFormData,
  AuthState,
  SigninFormData,
  SIGNIN_USER,
  SIGNUP_USER,
  SIGNUP_REQUEST,
  SIGNIN_REQUEST,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_PENDING,
  FORGOT_PASSWORD_COMPLETED,
  StatusPropsState,
  VERIFY_AUTH,
  AUTHENTICATE_USER,
  SIGNOUT_USER,
  SIGNOUT_REQUEST
} from '../../constants';
import {
  requestSignin,
  requestSignup,
  doForgotPassword,
  doResetPassword,
  forgotPasswordPending,
  forgotPasswordCompleted,
  auth,
  signout,
  signup,
  signin,
  verifyAuth,
  requestSignout
} from '../../actions';
import { dispatch } from '../../functions/utils';

afterEach(cleanup);

it('creates forgotPasswordCompleted action and return action', () => {
  const forgotPasswordCompletedAction: ReduxAction = {
    type: FORGOT_PASSWORD_COMPLETED,
    payload: {
      status: 'completed'
    }
  };
  const forgotPasswordCompletedMockFunc = jest.fn(() =>
    forgotPasswordCompleted()
  );

  forgotPasswordCompletedMockFunc();
  expect(forgotPasswordCompletedMockFunc).toHaveBeenCalledWith();
  expect(forgotPasswordCompleted()).toMatchObject(
    forgotPasswordCompletedAction
  );
});

it('creates forgotPasswordPending action and return action', () => {
  const forgotPasswordPendingAction: ReduxAction = {
    type: FORGOT_PASSWORD_PENDING,
    payload: {
      status: 'pending'
    }
  };
  const forgotPasswordPendingMockFunc = jest.fn(() => forgotPasswordPending());

  forgotPasswordPendingMockFunc();
  expect(forgotPasswordPendingMockFunc).toHaveBeenCalledWith();
  expect(forgotPasswordPending()).toMatchObject(forgotPasswordPendingAction);
});
it("creates doResetPassword action and should be called with 'password, token, callback' and return action", () => {
  const password: string = 'Kanyimuta123$';
  const token: string = 'PASSWORD_RESET_TOKEN';
  const callback = () => {};

  const doResetPasswordAction: ReduxAction = {
    type: FORGOT_PASSWORD_REQUEST
  };
  const doResetPasswordMockFunc = jest.fn(
    (password: string, token: string, callback: Function) =>
      doResetPassword(password, token, callback)(dispatch)
  );

  doResetPasswordMockFunc(password, token, callback);
  expect(doResetPasswordMockFunc).toHaveBeenCalledWith(
    password,
    token,
    callback
  );
  expect(doResetPassword(password, token, callback)(dispatch)).toMatchObject(
    doResetPasswordAction
  );
});

it("creates doForgotPassword action and should be called with 'email' and return action", () => {
  const email: string = 'support@kanyimuta.com';

  const doForgotPasswordAction: ReduxAction = {
    type: FORGOT_PASSWORD_REQUEST
  };
  const doForgotPasswordMockFunc = jest.fn((email: string) =>
    doForgotPassword(email)(dispatch)
  );

  doForgotPasswordMockFunc(email);
  expect(doForgotPasswordMockFunc).toHaveBeenCalledWith(email);
  expect(doForgotPassword(email)(dispatch)).toMatchObject(
    doForgotPasswordAction
  );
});

it("creates signup request action and should be called with 'signup data' and return action.", () => {
  const mockSignupData: SignupFormData = {
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'johndoe@gmail.com',
    dob: '12/12/1995',
    password: '********',
    institution: 'State University',
    department: 'Department',
    level: '100'
  };
  const requestSignupAction: ReduxAction = {
    type: SIGNUP_REQUEST
  };
  const requestSignupMockFunc = jest.fn((data: SignupFormData) =>
    requestSignup(data)(dispatch)
  );

  requestSignupMockFunc(mockSignupData);
  expect(requestSignupMockFunc).toHaveBeenCalledWith(mockSignupData);
  expect(requestSignup(mockSignupData)(dispatch)).toMatchObject(
    requestSignupAction
  );
});

it("creates signin request action and should be called with 'signin data' and return action.", () => {
  const mockSigninData: SigninFormData = {
    id: expect.any(String),
    password: expect.any(String)
  };
  const requestSigninAction: ReduxAction = {
    type: SIGNIN_REQUEST
  };
  const requestSigninMockFunc = jest.fn((data: SigninFormData) =>
    requestSignin(data)(dispatch)
  );

  requestSigninMockFunc(mockSigninData);
  expect(requestSigninMockFunc).toHaveBeenCalledWith(mockSigninData);
  expect(requestSignin(mockSigninData)(dispatch)).toMatchObject(
    requestSigninAction
  );
});

it("creates signup action and should be called with its 'status props' and return action.", () => {
  const mockSignupStatus: StatusPropsState = {
    status: expect.stringMatching(/settled|pending|fulfilled/),
    err: expect.any(Boolean),
    statusText: expect.any(String)
  };
  const signupAction: ReduxAction = {
    type: SIGNUP_USER,
    payload: {
      ...mockSignupStatus,
      statusText: 'Another feedback message for signup.'
    }
  };
  const signupMockFunc = jest.fn((payload: StatusPropsState) =>
    signup(payload)
  );

  signupMockFunc(mockSignupStatus);
  expect(signupMockFunc).toHaveBeenCalledWith(mockSignupStatus);
  expect(signup(mockSignupStatus)).toMatchObject(signupAction);
});

it("creates signin action and should be called with its 'status props' and return action", () => {
  const mockSigninStatus: StatusPropsState = {
    status: expect.stringMatching(/settled|pending|fulfilled/),
    err: expect.any(Boolean),
    statusText: expect.any(String)
  };
  const signinAction: ReduxAction = {
    type: SIGNIN_USER,
    payload: {
      ...mockSigninStatus,
      statusText: 'Another feedback message for signin.'
    }
  };
  const signinMockFunc = jest.fn((payload: StatusPropsState) =>
    signin(payload)
  );

  signinMockFunc(mockSigninStatus);
  expect(signinMockFunc).toHaveBeenCalledWith(mockSigninStatus);
  expect(signin(mockSigninStatus)).toMatchObject(signinAction);
});

it("creates verifyAuth action and should be called with dispatch as its inner func's param and return action.", () => {
  const verifyAuthAction: ReduxAction = {
    type: VERIFY_AUTH
  };
  const verifyAuthMockFunc = jest.fn((dispatch) => verifyAuth()(dispatch));

  verifyAuthMockFunc(dispatch);
  expect(verifyAuthMockFunc).toHaveBeenCalledWith(dispatch);
  expect(verifyAuthMockFunc).toReturnWith(verifyAuthAction);
});

it("creates auth action and should be called with its 'status props' and return action.", () => {
  const mockAuthStatus: AuthState = {
    status: expect.stringMatching(/settled|pending|fulfilled/),
    isAuthenticated: expect.any(Boolean)
  };
  const authAction: ReduxAction = {
    type: AUTHENTICATE_USER,
    payload: {
      ...mockAuthStatus,
      status: 'settled'
    }
  };
  const authMockFunc = jest.fn((payload: StatusPropsState) => auth(payload));

  authMockFunc(mockAuthStatus);
  expect(authMockFunc).toHaveBeenCalledWith(mockAuthStatus);
  expect(auth(mockAuthStatus)).toMatchObject(authAction);
});

it("requests signout action and should be called with dispatch as its inner func's param and return action.", () => {
  const signoutAction: ReduxAction = {
    type: SIGNOUT_REQUEST
  };
  const requestSignoutMockFunc = jest.fn((dispatch) =>
    requestSignout()(dispatch)
  );

  requestSignoutMockFunc(dispatch);
  expect(requestSignoutMockFunc).toHaveBeenCalledWith(dispatch);
  expect(requestSignoutMockFunc).toReturnWith(signoutAction);
});

it("creates signout action and should be called with its 'status props' and return action", () => {
  const mockSignoutStatus: StatusPropsState = {
    status: expect.stringMatching(/settled|pending|fulfilled/),
    err: expect.any(Boolean),
    statusText: expect.any(String)
  };
  const signoutAction: ReduxAction = {
    type: SIGNOUT_USER,
    payload: {
      ...mockSignoutStatus,
      statusText: 'A feedback message for signout.'
    }
  };
  const signoutMockFunc = jest.fn((payload: StatusPropsState) =>
    signout(payload)
  );

  signoutMockFunc(mockSignoutStatus);
  expect(signoutMockFunc).toHaveBeenCalledWith(mockSignoutStatus);
  expect(signout(mockSignoutStatus)).toMatchObject(signoutAction);
});
