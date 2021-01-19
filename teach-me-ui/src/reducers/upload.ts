import { SEND_FILES, UPLOADS, uploadState } from '../constants';
import { ReduxAction, UploadState } from '../types';

export const sendFiles = (
  state: UploadState = uploadState,
  action: ReduxAction
) => {
  if (action.type === SEND_FILES) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};

export const uploads = (
  state: UploadState = uploadState,
  action: ReduxAction
) => {
  if (action.type === UPLOADS) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
