import { 
  SEND_FILES, 
  ReduxAction 
} from '../constants';

export const sendFiles = (
  state: string[] = [],
  action: ReduxAction
) => {
  if (action.type === SEND_FILES) {
    return {
      ...state,
      payload: action.payload
    };
  };
  return state;
};