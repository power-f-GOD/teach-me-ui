// import axios from 'axios';

import { 
  // getState,
  dispatch,
  logError,
  displayModal,
  http
} from '../functions'

import { 
  // apiBaseURL as baseURL, 
  SEND_FILES,
  UPLOADS,
  GET_UPLOADS,
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

export const sendFilesToServer = (files: Array<File>, callbackAction: Function, reusedUploads: Array<any>, idParameter: string, array: boolean = true, actionParameters: any = {}) => {
  dispatch(sendFiles({
    status: 'pending'
  }));
  // let token = getState().userData.token;
  let ids: string[] = [];
  const recursiveUploadReturnsArrayOfId = (files1: Array<File>) => {
    const nextFile = files1.shift()
    if(nextFile){
      const formData = new FormData()
      formData.append('file', nextFile)

      // axios({
      //   url: '/upload',
      //   baseURL,
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content_Type': 'multipart/form-data'
      //   },
      //   data: formData
      // })
      http
        .post('/upload', formData, true, 'multipart/form-data')
        .then((response: any) => {
          const { error, data } = response;
          if (error) {
            logError(sendFiles)(data.error);
          } else {
            ids.push(data.id);
            recursiveUploadReturnsArrayOfId(files1)
          }
        })
        .catch(logError(sendFiles));
    } else {
      for (let localUpload of reusedUploads) {
        ids.push(localUpload.id);
      }
      dispatch(sendFiles({
        status: 'fulfilled',
        data: ids,
        err: false
      }));
      dispatch(getUploads);
      
      if (idParameter.includes('photo')) {
        displayModal(false);
      }
       
      let fileId = array ? ids : ids[0];
      let parameters : any = {...actionParameters};
      parameters[`${idParameter}`] = fileId;
      dispatch(callbackAction({...parameters})(dispatch));
      dispatch(sendFiles({
        status: 'settled',
        data: []
      }));
    }
  }
  recursiveUploadReturnsArrayOfId(Array.from(files));
}

export const getUploads = () => {
  // let token = getState().userData.token;
  dispatch(uploads({
    status: 'pending'
  }));

  // axios({
  //   url: '/uploads',
  //   baseURL,
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${token}`
  //   }
  // })
  http
    .get('/uploads', true)
    .then((response: any) => {
      const { error, data } = response;
      if (error) {
        dispatch(uploads({
          status: 'fulfilled',
          err: true
        }))
      } else {
        dispatch(uploads({
          status: 'fulfilled',
          err: false,
          data: data
        }))
      }
    })
    .catch(logError(uploads));
  return {
    type: GET_UPLOADS
  }
}