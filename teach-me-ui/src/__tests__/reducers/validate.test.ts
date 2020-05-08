import { cleanup } from '@testing-library/react';

import {
  firstname,
  lastname,
  password,
  email,
  username,
  dob,
  university,
  department,
  level,
  matchingInstitutions,
  signinId,
  signinPassword
} from '../../reducers/validate';
import {
  inputState,
  InputPropsState,
  ReduxAction,
  MatchingInstitutionsState
} from '../../constants';

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
  const dobMockFunc = jest.fn((state: InputPropsState, action: ReduxAction) =>
    dob(state, action)
  );
  const universityMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => university(state, action)
  );
  const departmentMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => department(state, action)
  );
  const levelMockFunc = jest.fn((state: InputPropsState, action: ReduxAction) =>
    level(state, action)
  );
  const matchingInstitutionsMockFunc = jest.fn(
    (state: MatchingInstitutionsState, action: ReduxAction) =>
      matchingInstitutions(state, action)
  );
  const signinIdMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) => signinId(state, action)
  );
  const signinPasswordMockFunc = jest.fn(
    (state: InputPropsState, action: ReduxAction) =>
      signinPassword(state, action)
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

  dobMockFunc(inputState, action);
  expect(dobMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(dob(mockInputState, action)).toMatchObject(inputState);

  passwordMockFunc(inputState, action);
  expect(passwordMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(password(mockInputState, action)).toMatchObject(inputState);

  universityMockFunc(inputState, action);
  expect(universityMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(university(mockInputState, action)).toMatchObject(inputState);

  departmentMockFunc(inputState, action);
  expect(departmentMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(department(mockInputState, action)).toMatchObject(inputState);

  levelMockFunc(inputState, action);
  expect(levelMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(level(mockInputState, action)).toMatchObject(inputState);

  matchingInstitutionsMockFunc(inputState, action);
  expect(matchingInstitutionsMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(matchingInstitutions(mockInputState, action)).toMatchObject(
    inputState
  );

  signinIdMockFunc(inputState, action);
  expect(signinIdMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(signinId(mockInputState, action)).toMatchObject(inputState);

  signinPasswordMockFunc(inputState, action);
  expect(signinPasswordMockFunc).toHaveBeenCalledWith(inputState, action);
  expect(signinPassword(mockInputState, action)).toMatchObject(inputState);
});
