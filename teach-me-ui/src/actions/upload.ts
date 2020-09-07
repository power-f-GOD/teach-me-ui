import axios from 'axios';

import { getState, dispatch } from '../functions'

import { 
  apiBaseURL as baseURL, 
  SEND_FILES 
} from '../constants'

const sendFiles = (payload: any) => {
  return {
    type: SEND_FILES,
    payload
  }
}

export const sendFilesToServer = (files: Array<File>) => {
  let token = getState().userData.token
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
        ids.push(data._id);
        recursiveUploadReturnsArrayOfId(files1)
      });
    } else {
      dispatch(sendFiles(ids))
    }
  }
  recursiveUploadReturnsArrayOfId(Array.from(files))
}