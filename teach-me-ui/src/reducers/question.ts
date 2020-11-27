import { ASK_QUESTION } from '../constants';
import { 
	questionState,
	QuestionState,
	ReduxAction
} from '../constants';

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