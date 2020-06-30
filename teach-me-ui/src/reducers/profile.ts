import { PROFILE_DATA } from '../constants/profile';
import { searchState } from '../constants/misc';
import { SearchState, ReduxAction } from '../constants/interfaces';

export const profileData = (
  state: SearchState = { ...searchState, data: [{}] },
  action: ReduxAction
) => {
  if (action.type === PROFILE_DATA) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
