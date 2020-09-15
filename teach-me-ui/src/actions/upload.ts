import axios from 'axios';

import { getState, dispatch, logError } from '../functions'

import { 
  apiBaseURL as baseURL, 
  SEND_FILES 
} from '../constants'

export const sendFiles = (payload: any = undefined) => {
  return {
    type: SEND_FILES,
    payload
  }
}

export const sendFilesToServer = (files: Array<File>, sendPost: Function, displayModal: Function) => {
  dispatch(sendFiles({
    status: 'pending'
  }));
  let token = getState().userData.token;
  let ids: string[] = [];
  const recursiveUploadReturnsArrayOfId = (files1: Array<File>) => {
    const nextFile = files1.shift()
    if(nextFile){
      const formData = new FormData()
      formData.append('file', nextFile)

      axios({
        url: '/upload',
        baseURL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content_Type': 'multipart/form-data'
        },
        data: formData
      }).then(({ data }: any) => {
        if (data.error) {
          logError(sendFiles);
        } else {
          ids.push(data._id);
          recursiveUploadReturnsArrayOfId(files1)
        }
      });
    } else {
      dispatch(sendFiles({
        status: 'fulfilled',
        data: ids,
        error: false
      }));
      sendPost().then(() => {
        displayModal(false);
      })
    }
  }
  recursiveUploadReturnsArrayOfId(Array.from(files))
}