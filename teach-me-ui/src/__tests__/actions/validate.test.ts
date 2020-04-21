import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  InputPropsState
} from '../../constants';
import {
  validateFirstname,
  validateUsername,
  validateEmail,
  validatePassword,
  validateLastname
} from '../../actions';

afterEach(cleanup);

it("creates validate (inputs) action and should be called with its 'state props' and return action.", () => {
  const mockInputState: InputPropsState = {
    value: expect.any(String),
    err: expect.any(Boolean),
    helperText: expect.any(String)
  };
  const validateAction: ReduxAction = {
    type: expect.any(String),
    payload: {
      value: 'Some value',
      err: true,
      helperText: 'Helper text'
    }
  };
  const validateMockFunc = jest.fn((payload: InputPropsState) => {
    validateFirstname(payload);
    validateLastname(payload);
    validateUsername(payload);
    validateEmail(payload);
    validatePassword(payload);
  });

  validateMockFunc(mockInputState);
  expect(validateMockFunc).toHaveBeenCalledWith(mockInputState);
  expect(validateFirstname(mockInputState)).toMatchObject(validateAction);
  expect(validateLastname(mockInputState)).toMatchObject(validateAction);
  expect(validateUsername(mockInputState)).toMatchObject(validateAction);
  expect(validateEmail(mockInputState)).toMatchObject(validateAction);
  expect(validatePassword(mockInputState)).toMatchObject(validateAction);
});
