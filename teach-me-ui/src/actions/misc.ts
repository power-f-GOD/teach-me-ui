import {
  ReduxAction,
  DISPLAY_SNACK_BAR,
  SnackbarState,
  SET_USER_DISPLAY_NAME,
  UserData,
  POPULATE_STATE_WITH_USER_DATA,
  wsBaseURL,
  INIT_WEB_SOCKET,
  CLOSE_WEB_SOCKET
} from '../constants';
import { getState } from '../functions/utils';

export const displaySnackbar = (payload: SnackbarState): ReduxAction => {
  return {
    type: DISPLAY_SNACK_BAR,
    payload
  };
};

export function setDisplayName(payload: string): ReduxAction {
  return {
    type: SET_USER_DISPLAY_NAME,
    payload
  };
}

export function setUserData(payload: UserData): ReduxAction {
  return {
    type: POPULATE_STATE_WITH_USER_DATA,
    payload
  };
}

export function initWebSocket(token: string): ReduxAction {
  const socket = new WebSocket(`${wsBaseURL}/socket?token=${token}`);

  //this is just to poll server and keep it alive as Heroku keeps shutting out the webSocket
  setInterval(() => {
    if (socket.readyState === 1)
      socket.send(
        JSON.stringify({
          pipe: 'POLL_SERVER',
          message: 'Ping!',
          time_stamp_id: Date.now()
        })
      );
  }, 30000);

  return {
    type: INIT_WEB_SOCKET,
    payload: socket
  };
}

export function closeWebSocket(): ReduxAction {
  getState().webSocket.close();

  return {
    type: CLOSE_WEB_SOCKET
  };
}
