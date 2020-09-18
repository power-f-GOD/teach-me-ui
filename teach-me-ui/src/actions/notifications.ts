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
  getState 
} from '../functions';


export const getNotifications = (payload: NotificationState) => {
  return {
    type: GET_NOTIFICATIONS,
    payload
  };
};

export const getNotificationsRequest = (date: number) => (
  dispatch: Function
): ReduxAction => {

  let token = getState().userData.token

  callNetworkStatusCheckerFor({
    name: 'getNotifications',
    func: getNotifications
  });
  dispatch(getNotifications({ status: 'pending' }));
  

  axios({
    url: `/notifications?offset=${date}`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    }
  })
  .then(({ data }: any) => {
    const { error, notifications, entities } = data as {
      error: boolean;
      notifications: any[];
      entities?: any
    };
    if (!error) {
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

export const pingUser = (users: string[], data?: { type?: 'NEW_CONVERSATION'; }) => {
  const socket: WebSocket = getState().webSocket as WebSocket;
  socket.send(JSON.stringify({ 
    users: users,
    pipe: 'PING_USER',
    data: {
      type: data?.type
    }
  }));
}

export const setLastseen = (id: string) => {
  let token = getState().userData.token

  axios({
    url: 'notifications/id/seen',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      'notification_id': id
    }
  })
}