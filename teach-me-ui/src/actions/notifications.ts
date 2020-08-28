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

  const cookieEnabled = navigator.cookieEnabled;

  let token = ''
  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  };

  callNetworkStatusCheckerFor({
    name: 'getNotifications',
    func: getNotifications
  });
  dispatch(getNotifications({ status: 'pending' }));
  

  axios({
    url: `/notifications?limit=20&offset=${date}`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    }
  })
  .then(({ data }: any) => {
    console.log(data)
    const { error, notifications, entities } = data as {
      error: boolean;
      notifications: any[];
      entities?: any
    };
    if (!error) {
      console.log(data);
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
  const cookieEnabled = navigator.cookieEnabled;

  let token = ''
  if (cookieEnabled) {
    token = JSON.parse(localStorage?.kanyimuta ?? {})?.token ?? null;
  }
  
  axios({
    url: 'notification/seen',
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