import { SearchState, ReduxAction, UserData } from '../../types';
import { checkNetworkStatusWhilstPend, logError, delay, http } from '../../utils';
import { SEARCH_KANYIMUTA, TRIGGER_SEARCH_KANYIMUTA } from '../../constants';

export const searchKanyimuta = (payload: SearchState) => {
  return {
    type: SEARCH_KANYIMUTA,
    payload
  };
};

export const triggerSearchKanyimuta = (keyword: string) => (
  dispatch: Function
): ReduxAction => {
  checkNetworkStatusWhilstPend({
    name: 'searchKanyimuta',
    func: searchKanyimuta
  });
  dispatch(searchKanyimuta({ status: 'pending' }));

  if (keyword) {
    delay(200).then(() => {
      http
        .get<UserData[]>(`/people/find?keyword=${keyword}&limit=20`, true)
        .then(({ error, data: people }) => {
          if (!error && !!people[0]) {
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
