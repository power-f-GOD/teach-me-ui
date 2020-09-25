import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  UploadState,
  uploadState,
  SEND_FILES,
  UPLOADS
} from '../../constants';

import { 
  sendFiles, 
  uploads 
} from '../../reducers/upload';


afterEach(cleanup);

it("upload reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockUploadState: UploadState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const uploadsAction: ReduxAction = {
    type: UPLOADS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const sendFilesAction: ReduxAction = {
    type: SEND_FILES,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const uploadsMockFunc = jest.fn((state: UploadState, action: ReduxAction) =>
    uploads(state, action)
  );

  const sendFilesMockFunc = jest.fn((state: UploadState, action: ReduxAction) =>
    sendFiles(state, action)
  );

  uploadsMockFunc(uploadState, uploadsAction);
  sendFilesMockFunc(uploadState, sendFilesAction);
  expect(uploadsMockFunc).toHaveBeenCalledWith(uploadState, uploadsAction);
  expect(sendFilesMockFunc).toHaveBeenCalledWith(uploadState, sendFilesAction);
  expect(uploads(uploadState, uploadsAction)).toMatchObject(mockUploadState);
  expect(sendFiles(uploadState, sendFilesAction)).toMatchObject(mockUploadState);
});
