import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/upload';
import { UPLOADS, GET_UPLOADS, SEND_FILES } from '../../constants';
import { UploadState, ReduxAction } from '../../types';

afterEach(cleanup);

it('sends files to the server', () => {
  const mockUploadState: UploadState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const sendFilesAction: ReduxAction = {
    type: SEND_FILES,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  expect(actions.sendFiles(mockUploadState)).toMatchObject(sendFilesAction);
});

it('gets files user has uploaded for recycling', () => {
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

  const getUploadsAction: ReduxAction = {
    type: GET_UPLOADS
  };

  const getUploadsMockFunc = jest.fn(() => {
    actions.uploads(mockUploadState);
  });

  expect(actions.uploads(mockUploadState)).toMatchObject(uploadsAction);
  expect(actions.getUploads()).toMatchObject(getUploadsAction);
});
