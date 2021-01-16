import {
  GET_USER_DETAILS,
  UPDATE_PASSWORD,
  UPDATE_USERNAME,
  UPDATE_EMAIL,
  UPDATE_USER_DATA,
  UPDATE_ACADEMIC_DATA,
  editProfileState
} from '../constants';
import { ReduxAction, EditProfileState } from '../types';

export const getUserDetails = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === GET_USER_DETAILS) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const updatePassword = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === UPDATE_PASSWORD) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const updateEmail = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === UPDATE_EMAIL) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const updateUsername = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === UPDATE_USERNAME) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const updateAcademicData = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === UPDATE_ACADEMIC_DATA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const updateUserData = (
  state: EditProfileState = editProfileState,
  action: ReduxAction
) => {
  if (action.type === UPDATE_USER_DATA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
