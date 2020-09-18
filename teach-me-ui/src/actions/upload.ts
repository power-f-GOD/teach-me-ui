import axios from 'axios';

import { getState, dispatch, logError } from '../functions'

import { 
  apiBaseURL as baseURL, 
  SEND_FILES,
  UPLOADS,
  GET_UPLOADS
} from '../constants'

export const sendFiles = (payload: any) => {
  return {
    type: SEND_FILES,
    payload
  }
}

export const uploads = (payload: any)=> {
  return {
    type: UPLOADS,
    payload
  } 
}

export const sendFilesToServer = (files: Array<File>, sendPost: Function, displayModal: Function, selectedUploads: Array<any>) => {
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
      for (let localUpload of selectedUploads) {
        ids.push(localUpload.id);
      }
      console.log(ids);
      dispatch(sendFiles({
        status: 'fulfilled',
        data: ids,
        error: false
      }));
      sendPost().then(() => {
        displayModal(false);
        dispatch(sendFiles({
          status: 'settled',
          data: []
        }));
      })
    }
  }
  recursiveUploadReturnsArrayOfId(Array.from(files))
}

export const getUploads = () => {
  let token = getState().userData.token;
  dispatch(uploads({
    status: 'pending'
  }));

  axios({
    url: '/uploads',
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(({ data }) => {
    console.log(data);
    
    if (data.error) {
      dispatch(uploads({
        status: 'fulfilled',
        error: true
      }))
    } else {
      dispatch(uploads({
        status: 'fulfilled',
        error: false,
        data: data.uploads
      }))
    }
  }).catch(logError(uploads));
  return {
    type: GET_UPLOADS
  }
}