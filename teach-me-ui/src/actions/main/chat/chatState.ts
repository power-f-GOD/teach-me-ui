import { ReduxAction, ChatState } from '../../../types';
import { SET_CHAT_STATE } from '../../../constants/chat';

export const chatState = (payload: ChatState): ReduxAction => {
  return {
    type: SET_CHAT_STATE,
    payload
  };
};
