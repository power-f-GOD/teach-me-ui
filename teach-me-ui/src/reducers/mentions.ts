import { SUGGEST_MENTIONS } from '../constants';
import { mentionState } from '../constants/misc';
import { MentionState, ReduxAction } from '../constants/interfaces';

export const suggestMentions = (
  state: MentionState = mentionState,
  action: ReduxAction
) => {
  if (action.type === SUGGEST_MENTIONS) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
