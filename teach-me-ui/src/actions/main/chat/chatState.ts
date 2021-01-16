import { ReduxAction, ChatState } from '../../../types';
import { SET_CHAT_STATE } from '../../../constants/chat';

export const chatState = (
  payload: ChatState,
  shouldPushState?: boolean
): ReduxAction => {
  const { pathname, queryParam } = payload;
  const { pathname: _pathname, search: _queryParam } = window.location;

  window.history[shouldPushState ? 'pushState' : 'replaceState'](
    {},
    document.title,
    (pathname || _pathname) + (queryParam || _queryParam)
  );

  return {
    type: SET_CHAT_STATE,
    payload
  };
};
