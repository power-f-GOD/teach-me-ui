import { ASK_QUESTION } from '../constants';
import { questionState } from '../constants';
import { QuestionState, ReduxAction } from '../types';

export const askQuestion = (
  state: QuestionState = questionState,
  action: ReduxAction
) => {
  if (action.type === ASK_QUESTION) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
