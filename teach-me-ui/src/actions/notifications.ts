// import axios from 'axios';

import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_REQUEST
  // apiBaseURL as baseURL,
} from '../constants';
import { ReduxAction, NotificationState } from '../types';

import {
  logError,
  checkNetworkStatusWhilstPend,
  getState,
  dispatch,
  http
} from '../functions';

import { displaySnackbar } from '../actions';

export const getNotifications = (payload: NotificationState) => {
  return {
    type: GET_NOTIFICATIONS,
    payload
  };
};

export const getNotificationsRequest = (date: number) => (
  dispatch: Function
): ReduxAction => {
  // let token = getState().userData.token;

  checkNetworkStatusWhilstPend({
    name: 'getNotifications',
    func: getNotifications
  });
  dispatch(getNotifications({ status: 'pending' }));

  // axios({
  //   url: `/notifications?offset=${date}`,
  //   baseURL,
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     Content_Type: 'application/json'
  //   }
  // })
  http
    .get(`/notifications?offset=${date}`, true)
    .then((response: any) => {
      const { error, data } = response;
      if (!error) {
        const { notifications, entities } = data as {
          notifications: Array<string>;
          entities: any;
        };
        dispatch(
          getNotifications({
            status: 'fulfilled',
            err: false,
            data: {
              notifications,
              entities
            }
          })
        );
      } else {
        dispatch(
          getNotifications({
            status: 'fulfilled',
            err: true
          })
        );
      }
    })
    .catch(logError(getNotifications));
  return {
    type: GET_NOTIFICATIONS_REQUEST,
    newState: date
  };
};

export const pingUser = (
  users: string[],
  data?: { type?: 'NEW_CONVERSATION' }
) => {
  const socket: WebSocket = getState().webSocket as WebSocket;

  socket.send(
    JSON.stringify({
      users: users,
      pipe: 'PING_USER',
      data: {
        type: data?.type
      }
    })
  );
};

export const setLastseen = () => {
  // let token = getState().userData.token;

  // axios({
  //   url: 'notifications/seen',
  //   baseURL,
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     Content_Type: 'application/json'
  //   }
  // })
  http
    .post('/notifications/seen', {}, true)
    .then((data) => {
      dispatch(getNotificationsRequest(Date.now())(dispatch));
    })
    .catch((e: any) => {
      let message = /network/i.test(e.message)
        ? 'A network error occurred. Check your internet connection.'
        : e.message;

      dispatch(
        displaySnackbar({
          open: true,
          message: navigator.onLine
            ? `${message[0].toUpperCase()}${message.slice(1)}.`
            : 'You are offline.',
          severity: 'error'
        })
      );
    });
};
