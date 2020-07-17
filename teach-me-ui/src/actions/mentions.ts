import axios from 'axios';

import { apiBaseURL as baseURL } from '../constants/misc';
import { MentionState, ReduxAction } from '../constants/interfaces';
import {
  callNetworkStatusCheckerFor,
  logError,
} from '../functions/utils';
import {
  SUGGEST_MENTIONS,
  TRIGGER_SUGGEST_MENTIONS
} from '../constants';

export const suggestMentions = (payload: MentionState) => {
  return {
    type: SUGGEST_MENTIONS,
    payload
  };
};

export const triggerSuggestMentions = (keyword: string = '') => (
  dispatch: Function
): ReduxAction => {
  const cookieEnabled = navigator.cookieEnabled;

  let token = ''
  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  };

  callNetworkStatusCheckerFor({
    name: 'suggestMentions',
    func: suggestMentions
  });
  dispatch(suggestMentions({ status: 'pending' }));

  // delay(200).then(() => {
    axios({
      url: `/colleagues/find?keyword=${keyword}`,
      baseURL,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(({ data }: any) => {
        const { error, colleagues } = data as {
          error: boolean;
          colleagues: any[];
        };
        if (!error && !!colleagues[0]) {
          dispatch(
            suggestMentions({
              status: 'fulfilled',
              err: false,
              data: colleagues
            })
          );
        } else {
          dispatch(
            suggestMentions({
              status: 'fulfilled',
              err: true,
              data: colleagues
            })
          );
        }
      })
      .catch(logError(suggestMentions));
  // });

  return {
    type: TRIGGER_SUGGEST_MENTIONS,
    newState: keyword
  };
};
