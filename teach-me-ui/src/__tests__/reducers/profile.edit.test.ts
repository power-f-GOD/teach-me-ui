import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  editProfileState,
  EditProfileState,
  UPDATE_ACADEMIC_DATA_REQUEST,
  UPDATE_EMAIL_REQUEST,
  GET_USER_DETAILS_REQUEST,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_USERNAME_REQUEST,
  UPDATE_USER_DATA_REQUEST
} from '../../constants';
import * as reducers from '../../reducers/profile.edit';

afterEach(cleanup);

it("profile edit reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockEditProfileState: EditProfileState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const getUserDetailsMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.getUserDetails(state, action)
  );

  const updateAcademicDataMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.updateAcademicData(state, action)
  );

  const updateEmailMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.updateEmail(state, action)
  );

  const updatePasswordMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.updatePassword(state, action)
  );

  const updateUserDataMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.updateUserData(state, action)
  );

  const updateUsernameMockFunc = jest.fn((state: EditProfileState, action: ReduxAction) =>
    reducers.updateUsername(state, action)
  );

  const updateAcademicDataRequestAction: ReduxAction = {
    type: UPDATE_ACADEMIC_DATA_REQUEST,
  };

  const updateEmailRequestAction: ReduxAction = {
    type: UPDATE_EMAIL_REQUEST,
  };

  const getUserDetailsRequestAction: ReduxAction = {
    type: GET_USER_DETAILS_REQUEST,
  };
  
  const updatePasswordRequestAction: ReduxAction = {
    type: UPDATE_PASSWORD_REQUEST,
  };

  const updateUsernameRequestAction: ReduxAction = {
    type: UPDATE_USERNAME_REQUEST,
  };

  const updateUserDataRequestAction: ReduxAction = {
    type: UPDATE_USER_DATA_REQUEST,
  };
  
  getUserDetailsMockFunc(editProfileState, getUserDetailsRequestAction);
  updateAcademicDataMockFunc(editProfileState, updateAcademicDataRequestAction);
  updateEmailMockFunc(editProfileState, updateEmailRequestAction);
  updatePasswordMockFunc(editProfileState, updatePasswordRequestAction);
  updateUserDataMockFunc(editProfileState, updateUserDataRequestAction);
  updateUsernameMockFunc(editProfileState, updateUsernameRequestAction);
  expect(getUserDetailsMockFunc).toHaveBeenCalledWith(editProfileState, getUserDetailsRequestAction);
  expect(updateAcademicDataMockFunc).toHaveBeenCalledWith(editProfileState, updateAcademicDataRequestAction);
  expect(updateEmailMockFunc).toHaveBeenCalledWith(editProfileState, updateEmailRequestAction);
  expect(updatePasswordMockFunc).toHaveBeenCalledWith(editProfileState, updatePasswordRequestAction);
  expect(updateUserDataMockFunc).toHaveBeenCalledWith(editProfileState, updateUserDataRequestAction);
  expect(updateUsernameMockFunc).toHaveBeenCalledWith(editProfileState, updateUsernameRequestAction);
  expect(reducers.getUserDetails(editProfileState, getUserDetailsRequestAction)).toMatchObject(mockEditProfileState);
  expect(reducers.updateAcademicData(editProfileState, updateAcademicDataRequestAction)).toMatchObject(mockEditProfileState);
  expect(reducers.updateEmail(editProfileState, updateEmailRequestAction)).toMatchObject(mockEditProfileState);
  expect(reducers.updatePassword(editProfileState, updatePasswordRequestAction)).toMatchObject(mockEditProfileState);
  expect(reducers.updateUserData(editProfileState, updateUserDataRequestAction)).toMatchObject(mockEditProfileState);
  expect(reducers.updateUsername(editProfileState, updateUsernameRequestAction)).toMatchObject(mockEditProfileState);
});