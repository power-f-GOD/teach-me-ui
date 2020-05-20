import { cleanup } from '@testing-library/react';

import {
  firstname,
  lastname,
  password,
  email,
  username,
  dob,
  institution,
  department,
  level,
  matchingInstitutions,
  signinId,
  signinPassword
} from '../../reducers/validate';
import {
  basicInputState,
  academicInputState,
  BasicInputState,
  ReduxAction,
  SearchState,
  AcademicInputState
} from '../../constants';

afterEach(cleanup);

it("validate reducers should be called with 'state' and 'action' and return object of type InputPropsState", () => {
  const [basicInputStateVal, academicInputStateVal] = [
    expect.any(String),
    expect.any({ keyword: '', uid: '' })
  ];
  const mockInputState: BasicInputState | AcademicInputState = {
    value: basicInputStateVal,
    err: expect.any(Boolean),
    helperText: expect.any(String)
  };
  const action: ReduxAction = {
    type: 'VALIDATE_INPUT',
    payload: { ...mockInputState, helperText: 'New helper text.' }
  };
  const firstnameMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) => firstname(state, action)
  );
  const lastnameMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) => lastname(state, action)
  );
  const usernameMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) => username(state, action)
  );
  const emailMockFunc = jest.fn((state: BasicInputState, action: ReduxAction) =>
    email(state, action)
  );
  const passwordMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) => password(state, action)
  );
  const dobMockFunc = jest.fn((state: BasicInputState, action: ReduxAction) =>
    dob(state, action)
  );
  const institutionMockFunc = jest.fn(
    (state: AcademicInputState, action: ReduxAction) =>
      institution(state, action)
  );
  const departmentMockFunc = jest.fn(
    (state: AcademicInputState, action: ReduxAction) =>
      department(state, action)
  );
  const levelMockFunc = jest.fn(
    (state: AcademicInputState, action: ReduxAction) => level(state, action)
  );
  const matchingInstitutionsMockFunc = jest.fn(
    (state: SearchState, action: ReduxAction) =>
      matchingInstitutions(state, action)
  );
  const signinIdMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) => signinId(state, action)
  );
  const signinPasswordMockFunc = jest.fn(
    (state: BasicInputState, action: ReduxAction) =>
      signinPassword(state, action)
  );

  firstnameMockFunc(basicInputState, action);
  expect(firstnameMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(firstname(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  lastnameMockFunc(basicInputState, action);
  expect(lastnameMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(lastname(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  usernameMockFunc(basicInputState, action);
  expect(usernameMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(username(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  emailMockFunc(basicInputState, action);
  expect(emailMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(email(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  dobMockFunc(basicInputState, action);
  expect(dobMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(dob(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  passwordMockFunc(basicInputState, action);
  expect(passwordMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(password(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  signinIdMockFunc(basicInputState, action);
  expect(signinIdMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(signinId(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  signinPasswordMockFunc(basicInputState, action);
  expect(signinPasswordMockFunc).toHaveBeenCalledWith(basicInputState, action);
  expect(signinPassword(<BasicInputState>mockInputState, action)).toMatchObject(
    basicInputState
  );

  // mockInputState.value = academicInputStateVal;

  // institutionMockFunc(academicInputState, action);
  // expect(institutionMockFunc).toHaveBeenCalledWith(academicInputState, action);
  // expect(institution(<AcademicInputState>mockInputState, action)).toMatchObject(
  //   academicInputState
  // );

  // departmentMockFunc(academicInputState, action);
  // expect(departmentMockFunc).toHaveBeenCalledWith(academicInputState, action);
  // expect(department(<AcademicInputState>mockInputState, action)).toMatchObject(
  //   academicInputState
  // );

  // levelMockFunc(academicInputState, action);
  // expect(levelMockFunc).toHaveBeenCalledWith(academicInputState, action);
  // expect(level(<AcademicInputState>mockInputState, action)).toMatchObject(
  //   academicInputState
  // );

  // matchingInstitutionsMockFunc(basicInputState, action);
  // expect(matchingInstitutionsMockFunc).toHaveBeenCalledWith(
  //   basicInputState,
  //   action
  // );
  // expect(matchingInstitutions(mockInputState, action)).toMatchObject(
  //   basicInputState
  // );
});
