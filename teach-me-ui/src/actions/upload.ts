import { 
  SEND_FILE, 
  SEND_FILE_TO_SERVER,
  apiBaseURL as baseURL
} from '../constants';

import axios from 'axios';

import { 
  callNetworkStatusCheckerFor, 
  logError, 
  getState 
} from '../functions';


export const sendFile = (payload: any) => {
  return {
    type: SEND_FILE,
    payload
  }
}

export const sendFileToServer = (file: File) => (
  dispatch: Function
) => {
  let token = getState().userData.token

  const formData = new FormData()
  formData.append('file', file)
  
  callNetworkStatusCheckerFor({
    name: 'sendFile',
    func: sendFile
  })
  dispatch(
    sendFile({
      status: 'pending'
    })
  )

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
    console.log(data._id)
      const { error, _id } = data as {
        error: boolean;
        _id: string;
      };
      if (!error) {
        dispatch(
          sendFile({
            status: 'fulfilled',
            err: false,
            _id
          })
        );
      } else {
        dispatch(
          sendFile({
            status: 'fulfilled',
            err: true
          })
        );
      }
    })
    .catch(logError(sendFile));
  return {
    type: SEND_FILE_TO_SERVER
  }
}
