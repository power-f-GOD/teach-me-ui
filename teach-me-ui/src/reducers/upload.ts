import { 
  SEND_FILE,
  ReduxAction,
  UploadState,
  uploadState,
} from '../constants';


export const sendFile = (
  state: UploadState = uploadState,
  action: ReduxAction
) => {
  if (action.type === SEND_FILE) {
    return {
      ...state,
      ...action.payload
    };
  };
  return state;
};