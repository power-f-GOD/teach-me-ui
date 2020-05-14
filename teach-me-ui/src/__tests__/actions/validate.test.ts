import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  BasicInputState,
  AcademicInputState,
  inputErrState
} from '../../constants';
import {
  validateFirstname,
  validateLastname,
  validateUsername,
  validateEmail,
  validateDob,
  validatePassword,
  validateInstitution,
  validateDepartment,
  validateLevel
} from '../../actions';

afterEach(cleanup);

it("creates validate (inputs) action and should be called with its 'state props' and return action.", () => {
  const mockInputState: BasicInputState | AcademicInputState = {
    value: expect.any(String) || expect.any({ keyword: '', uid: '' }),
    err: expect.any(Boolean),
    helperText: expect.any(String)
  };
  const [basicInfoValue, academicInfoValue] = [
    'Some value',
    { keyword: 'Keyword', uid: 'Uid' }
  ];
  const validateAction: ReduxAction = {
    type: expect.any(String),
    payload: {
      value: basicInfoValue || academicInfoValue,
      err: true,
      helperText: 'Helper text'
    }
  };
  const validateMockFunc = jest.fn(
    (payload: BasicInputState | AcademicInputState) => {
      validateFirstname(<BasicInputState>payload);
      validateLastname(<BasicInputState>payload);
      validateUsername(<BasicInputState>payload);
      validateEmail(<BasicInputState>payload);
      validateDob(<BasicInputState>payload);
      validatePassword(<BasicInputState>payload);

      validateInstitution(payload as AcademicInputState);
      validateDepartment(<AcademicInputState>payload);
      validateLevel(<AcademicInputState>payload);
    }
  );

  validateMockFunc(mockInputState);
  expect(validateMockFunc).toHaveBeenCalledWith(mockInputState);
  expect(validateFirstname(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validateLastname(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validateUsername(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validateEmail(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validateDob(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validatePassword(<BasicInputState>mockInputState)).toMatchObject(
    validateAction
  );

  // validateAction.payload.value = academicInfoValue;
  // mockInputState.value = expect.any({ keyword: expect.any(String), uid: expect.any(String) });

  expect(validateInstitution(mockInputState as AcademicInputState)).toMatchObject(
    validateAction
  );
  expect(validateDepartment(<AcademicInputState>mockInputState)).toMatchObject(
    validateAction
  );
  expect(validateLevel(<AcademicInputState>mockInputState)).toMatchObject(
    validateAction
  );
});
