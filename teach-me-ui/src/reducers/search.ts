import { SEARCH_KANYIMUTA } from '../constants/search';
import { searchState } from '../constants/misc';
import { SearchState, ReduxAction } from '../constants/interfaces';

export const searchKanyimuta = (
  state: SearchState = searchState,
  action: ReduxAction
) => {
  if (action.type === SEARCH_KANYIMUTA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
