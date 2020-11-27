import axios from 'axios';

import { 
	QuestionState,
	ReduxAction,
	SEND_QUESTION_TO_SERVER,
	ASK_QUESTION,
	apiBaseURL as baseURL,
	UserData
} from '../constants';
import { 
	callNetworkStatusCheckerFor, 
	getState,
	logError
} from '../functions';

export const askQuestion = (payload: QuestionState) => {
	return {
		type: ASK_QUESTION,
		payload
	}
}

export const sendQuestionToServer = (para: object) => (
  dispatch: Function
): ReduxAction => {
  const userData = getState().userData as UserData;
  const token = userData.token as string;

  callNetworkStatusCheckerFor({
    name: 'askQuestion',
    func: askQuestion
  });
  dispatch(askQuestion({ status: 'pending' }));

  
	axios({
		url: `/question/make`,
		baseURL,
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
		.then(({ data }: any) => {
			const { people } = data.data as {
				people: any[];
			};

			if (!data.error && !!people[0]) {
				dispatch(
					askQuestion({
						status: 'fulfilled',
						err: false
					})
				);
			} else {
				dispatch(
					askQuestion({
						status: 'fulfilled',
						err: true
					})
				);
			}
		})
		.catch(logError(askQuestion));

  return {
    type: SEND_QUESTION_TO_SERVER,
  };
};
