import { cleanup } from '@testing-library/react';

import { firstname, lastname, password, email, username } from '../validate';
import { inputState, InputPropsState, ReduxAction } from '../../constants';

afterEach(cleanup);

it("validate reducers should be called with 'state' and 'action' and return object of type InputPropsState", () => {
  const mockInputState: InputPropsState = {
    value: expect.any(String),
    err: expect.any(Boolean),
    helperText: expect.any(String)
  };
  const action: ReduxAction = {
    type: 'VALIDATE_INPUT',
    payload: { ...mockInputState, helperText: 'New helper text.' }
  };
  const firstnameMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => firstname(state, action)
  );
  const lastnameMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => lastname(state, action)
  );
  const usernameMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => username(state, action)
  );
  const emailMockFunc = jest.fn((state: InputPropsState, action: ReduxAction) =>
    email(state, action)
  );
  const passwordMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => password(state, action)
  );

  firstnameMockFunc(inputState, action);
  expect(firstnameMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(firstname(mockInputState, action)).toMatchObject(inputState);

  lastnameMockFunc(inputState, action);
  expect(lastnameMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(lastname(mockInputState, action)).toMatchObject(inputState);

  usernameMockFunc(inputState, action);
  expect(usernameMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(username(mockInputState, action)).toMatchObject(inputState);

  emailMockFunc(inputState, action);
  expect(emailMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(email(mockInputState, action)).toMatchObject(inputState);

  passwordMockFunc(inputState, action);
  expect(passwordMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(password(mockInputState, action)).toMatchObject(inputState);
});
