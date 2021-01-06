import {
  ReduxAction,
  DISPLAY_SNACK_BAR,
  SnackbarState,
  SET_USER_DISPLAY_NAME,
  UserData,
  POPULATE_STATE_WITH_USER_DATA,
  wsBaseURL,
  INIT_WEB_SOCKET,
  CLOSE_WEB_SOCKET,
  TRIGGER_NOTIFICATION_SOUND,
  NotificationSoundState
} from '../constants';
import { getState } from '../functions/utils';
import { dispatch } from '../appStore';

export const triggerNotificationSound = (_payload: NotificationSoundState) => {
  const { isReady } = getState().notificationSound as NotificationSoundState;
  const payload = { ..._payload };

  if (!isReady) {
    payload.play = false;
    payload.isPlaying = false;
  }

  switch (payload.toneType) {
    case 'incoming-message':
      payload.toneName = 'slow-spring-board-570';
      break;
    case 'outgoing-message':
      payload.toneName = 'open-ended-563';
      break;
    case 'action-success':
      payload.toneName = 'exquisite-557';
      break;
    case 'general':
      payload.toneName = 'piece-of-cake-611';
      break;
  }

  return {
    type: TRIGGER_NOTIFICATION_SOUND,
    payload
  };
};

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

export function setUserData(payload: Partial<UserData>): ReduxAction {
  return {
    type: POPULATE_STATE_WITH_USER_DATA,
    payload
  };
}

export function initWebSocket(token: string): ReduxAction {
  //close webSocket if initially open to avoid bugs of double responses
  dispatch(closeWebSocket());

  const socket = new WebSocket(`${wsBaseURL}/socket?token=${token}`);

  //this is just to poll server and keep it alive as Heroku keeps shutting out the webSocket
  const pollServer = () => {
    const connectionIsAlive = window.navigator.onLine;

    if (socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          pipe: 'PING',
          message: 'Ping!',
          time_stamp_id: Date.now()
        })
      );
    }

    const timeout = setTimeout(pollServer, 20000);

    if (!connectionIsAlive) {
      clearTimeout(timeout);
    }
  };

  pollServer();

  return {
    type: INIT_WEB_SOCKET,
    payload: socket
  };
}

// export function isAlive

export function closeWebSocket(): ReduxAction {
  if (getState().webSocket) {
    getState().webSocket.close();
  }

  return {
    type: CLOSE_WEB_SOCKET
  };
}
