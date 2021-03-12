// import axios from 'axios';

import {
  // getState,
  dispatch,
  logError,
  displayModal,
  http
} from '../functions';

import {
  // apiBaseURL as baseURL,
  SEND_FILES,
  UPLOADS,
  GET_UPLOADS
} from '../constants';
import { APIUploadModel } from '../types';

export const sendFiles = (payload: any) => {
  return {
    type: SEND_FILES,
    payload
  };
};

export const uploads = (payload: any) => {
  return {
    type: UPLOADS,
    payload
  };
};

export const uploadFiles = (
  files: Array<File>,
  callbackAction: Function,
  reusedUploads: Array<any>,
  idParameter: string,
  isArray: boolean = true,
  actionParameters: any = {}
) => {
  dispatch(
    sendFiles({
      status: 'pending'
    })
  );
  let idsOfUploads: string[] = [];
  const recursivelyUploadFiles = (filesToUpload: Array<File>) => {
    const nextFile = filesToUpload.shift();

    if (nextFile) {
      const formData = new FormData();

      formData.append('file', nextFile);
      http
        .post<APIUploadModel>('/upload', formData, true, 'multipart/form-data')
        .then(({ error, message, data }) => {
          if (error && message) {
            logError(sendFiles)({ name: 'FileUpload', message });
          } else {
            idsOfUploads.push(data.id);
            recursivelyUploadFiles(filesToUpload);
          }
        })
        .catch(logError(sendFiles));
    } else {
      for (let localUpload of reusedUploads) {
        idsOfUploads.push(localUpload.id);
      }

      dispatch(
        sendFiles({
          status: 'fulfilled',
          data: idsOfUploads,
          err: false
        })
      );
      dispatch(getUploads);

      if (idParameter.includes('photo')) {
        displayModal(false);
      }

      let fileId = isArray ? idsOfUploads : idsOfUploads[0];
      let parameters: any = { ...actionParameters };

      parameters[`${idParameter}`] = fileId;

      dispatch(callbackAction({ ...parameters })(dispatch));
      dispatch(
        sendFiles({
          status: 'settled',
          data: []
        })
      );
    }
  };

  recursivelyUploadFiles(Array.from(files));
};

export const getUploads = () => {
  dispatch(
    uploads({
      status: 'pending'
    })
  );

  http
    .get<APIUploadModel[]>('/uploads', true)
    .then(({ error: err, message, data }) => {
      dispatch(
        uploads({
          status: err ? 'settled' : 'fulfilled',
          err,
          ...(!err ? { data } : {})
        })
      );
    })
    .catch(logError(uploads));

  return {
    type: GET_UPLOADS
  };
};
