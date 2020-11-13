import axios from 'axios';

import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_REQUEST,
  ReduxAction,
  apiBaseURL as baseURL,
  NotificationState
} from '../constants';

import {
  logError,
  callNetworkStatusCheckerFor,
  getState,
  dispatch
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
  let token = getState().userData.token;

  callNetworkStatusCheckerFor({
    name: 'getNotifications',
    func: getNotifications
  });
  dispatch(getNotifications({ status: 'pending'}));

  axios({
    url: `/notifications?offset=${date}`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Content_Type: 'application/json'
    }
  })
    .then((response : any) => {
      const { error, data } = response.data;
      if (!error) {
        const { notifications, entities } = data.notifications as {
          notifications: Array<string>;
          entities: any
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
  let token = getState().userData.token;

  axios({
    url: `notificationS/seen`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Content_Type: 'application/json'
    }
  }).then((data) => {
    dispatch(getNotificationsRequest(Date.now())(dispatch));
  }).catch((e: any) => {
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
