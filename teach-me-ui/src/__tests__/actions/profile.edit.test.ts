import {
  GET_USER_DETAILS,
  UPDATE_PASSWORD,
  UPDATE_USERNAME,
  UPDATE_EMAIL,
  UPDATE_USER_DATA,
  UPDATE_ACADEMIC_DATA
} from '../../constants';
import { EditProfileState, ReduxAction } from '../../types';

import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/profile.edit';

afterEach(cleanup);

it("sends data to the server to update a user's profile", () => {
  const mockEditProfileState: EditProfileState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const getUserDetailsAction: ReduxAction = {
    type: GET_USER_DETAILS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const updatePasswordAction: ReduxAction = {
    type: UPDATE_PASSWORD,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const updateUsernameAction: ReduxAction = {
    type: UPDATE_USERNAME,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const updateEmailAction: ReduxAction = {
    type: UPDATE_EMAIL,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const updateUserDataAction: ReduxAction = {
    type: UPDATE_USER_DATA,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const updateAcademicDataAction: ReduxAction = {
    type: UPDATE_ACADEMIC_DATA,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const getUserDetailsRequestMockFunc = jest.fn(() => {
    return (dispatch: Function) => {
      actions.getUserDetails(mockEditProfileState);
    };
  });

  const mockCurrentPassword = expect.any(String);
  const mockNewPassword = expect.any(String);

  const updatePasswordRequestMockFunc = jest.fn(
    (current_password: string, new_password: string) => {
      return (dispatch: Function) => {
        actions.getUserDetails(mockEditProfileState);
      };
    }
  );

  const mockUsername = expect.any(String);

  const updateUsernameRequestMockFunc = jest.fn((username: string) => {
    return (dispatch: Function) => {
      actions.getUserDetails(mockEditProfileState);
    };
  });

  const mockEmail = expect.any(String);

  const updateEmailRequestMockFunc = jest.fn((email: string) => {
    return (dispatch: Function) => {
      actions.getUserDetails(mockEditProfileState);
    };
  });

  const mockUserData = expect.any(Object);

  const updateUserDataRequestMockFunc = jest.fn((data: Object) => {
    return (dispatch: Function) => {
      actions.getUserDetails(mockEditProfileState);
    };
  });

  const mocklevel = expect.any(String);
  const mockDepartment = expect.any(String);

  const updateAcademicDataRequestMockFunc = jest.fn(
    (level: string, department: string) => {
      return (dispatch: Function) => {
        actions.getUserDetails(mockEditProfileState);
      };
    }
  );

  getUserDetailsRequestMockFunc();
  updatePasswordRequestMockFunc(mockCurrentPassword, mockNewPassword);
  updateEmailRequestMockFunc(mockEmail);
  updateUserDataRequestMockFunc(mockUserData);
  updateUsernameRequestMockFunc(mockUsername);
  updateAcademicDataRequestMockFunc(mocklevel, mockDepartment);
  expect(updatePasswordRequestMockFunc).toHaveBeenCalledWith(
    mockCurrentPassword,
    mockNewPassword
  );
  expect(updateEmailRequestMockFunc).toHaveBeenCalledWith(mockEmail);
  expect(updateUserDataRequestMockFunc).toHaveBeenCalledWith(mockUserData);
  expect(updateUsernameRequestMockFunc).toHaveBeenCalledWith(mockUsername);
  expect(updateAcademicDataRequestMockFunc).toHaveBeenCalledWith(
    mocklevel,
    mockDepartment
  );
  expect(actions.getUserDetails(mockEditProfileState)).toMatchObject(
    getUserDetailsAction
  );
  expect(actions.updateAcademicData(mockEditProfileState)).toMatchObject(
    updateAcademicDataAction
  );
  expect(actions.updateEmail(mockEditProfileState)).toMatchObject(
    updateEmailAction
  );
  expect(actions.updatePassword(mockEditProfileState)).toMatchObject(
    updatePasswordAction
  );
  expect(actions.updateUsername(mockEditProfileState)).toMatchObject(
    updateUsernameAction
  );
  expect(actions.updateUserData(mockEditProfileState)).toMatchObject(
    updateUserDataAction
  );
});
