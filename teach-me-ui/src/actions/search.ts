import axios from 'axios';

import { apiBaseURL as baseURL } from '../constants/misc';
import { SearchState, ReduxAction, UserData } from '../constants/interfaces';
import {
  callNetworkStatusCheckerFor,
  logError,
  delay,
  getState
} from '../functions/utils';
import {
  SEARCH_KANYIMUTA,
  TRIGGER_SEARCH_KANYIMUTA
} from '../constants/search';

export const searchKanyimuta = (payload: SearchState) => {
  return {
    type: SEARCH_KANYIMUTA,
    payload
  };
};

export const triggerSearchKanyimuta = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  const userData = getState().userData as UserData;
  const token = userData.token as string;

  callNetworkStatusCheckerFor({
    name: 'searchKanyimuta',
    func: searchKanyimuta
  });
  dispatch(searchKanyimuta({ status: 'pending' }));

  if (keyword) {
    delay(200).then(() => {
      axios({
        url: `/people/find?keyword=${keyword}&limit=20`,
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
              searchKanyimuta({
                status: 'fulfilled',
                err: false,
                data: people
              })
            );
          } else {
            dispatch(
              searchKanyimuta({
                status: 'fulfilled',
                err: true,
                data: people
              })
            );
          }
        })
        .catch(logError(searchKanyimuta));
    });
  } else {
    dispatch(
      searchKanyimuta({
        status: 'settled',
        err: false,
        data: []
      })
    );
  }

  return {
    type: TRIGGER_SEARCH_KANYIMUTA,
    newState: keyword
  };
};
