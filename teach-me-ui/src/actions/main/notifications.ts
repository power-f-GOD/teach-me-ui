// import axios from 'axios';

import {
  SET_NOTIFICATIONS,
  GET_NOTIFICATIONS,
  PING_USER
  // apiBaseURL as baseURL,
} from '../../constants';
import { ReduxAction, NotificationState, PingUserProps } from '../../types';

import {
  logError,
  checkNetworkStatusWhilstPend,
  getState,
  dispatch,
  http
} from '../../functions';

export const getNotifications = (date: number) => (
  dispatch: Function
): ReduxAction => {
  checkNetworkStatusWhilstPend({
    name: 'notifications',
    func: notifications
  });
  dispatch(notifications({ status: 'pending' }));

  http
    .get<{
      notifications: Array<string>;
      entities: any;
    }>(`/notifications?offset=${date}`, true)
    .then(({ error: err, data: { notifications: notifs, entities } }) => {
      dispatch(
        notifications({
          status: err ? 'settled' : 'fulfilled',
          err,
          data: !err
            ? {
                notifications: notifs,
                entities
              }
            : {}
        })
      );
    })
    .catch(logError(notifications));

  return {
    type: GET_NOTIFICATIONS,
    newState: date
  };
};

export const notifications = (payload: NotificationState) => {
  return {
    type: SET_NOTIFICATIONS,
    payload
  };
};

export const pingUser = <T = PingUserProps>(users: string[], data?: T) => {
  const socket: WebSocket = getState().webSocket as WebSocket;

  socket.send(
    JSON.stringify({
      users: users,
      pipe: PING_USER,
      data
    })
  );
};

export const setLastseen = () => {
  http
    .post('/notifications/seen', {}, true)
    .then(() => {
      dispatch(getNotifications(Date.now())(dispatch));
    })
    .catch(logError(notifications));
};
