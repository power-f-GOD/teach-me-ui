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
  NotificationSoundState,
  TONE_TYPE__INCOMING_MESSAGE,
  TONE_TYPE__ACTION_SUCCESS,
  TONE_NAME__SLOW_SPRING_BOARD,
  TONE_NAME__OPEN_ENDED,
  TONE_NAME__EXQUISITE,
  TONE_NAME__PIECE_OF_CAKE,
  TONE_TYPE__GENERAL,
  TONE_TYPE__OUTGOING_MESSAGE
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
    case TONE_TYPE__INCOMING_MESSAGE:
      payload.toneName = TONE_NAME__SLOW_SPRING_BOARD;
      break;
    case TONE_TYPE__OUTGOING_MESSAGE:
      payload.toneName = TONE_NAME__OPEN_ENDED;
      break;
    case TONE_TYPE__ACTION_SUCCESS:
      payload.toneName = TONE_NAME__EXQUISITE;
      break;
    case TONE_TYPE__GENERAL:
      payload.toneName = TONE_NAME__PIECE_OF_CAKE;
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
  const socket = getState().webSocket as WebSocket;

  if (socket) {
    socket.close();
  }

  return {
    type: CLOSE_WEB_SOCKET
  };
}
