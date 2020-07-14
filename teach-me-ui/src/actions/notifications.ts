import axios from 'axios';

import { 
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_REQUEST,
  
  ReduxAction,
  apiBaseURL as baseURL,
  NotificationState
} from '../constants';

import { logError, callNetworkStatusCheckerFor } from '../functions';

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
    const { error, notifications } = data as {
      error: boolean;
      notifications: any[];
    };

    if (!error && !!notifications[0]) {
      dispatch(
        getNotifications({
          status: 'fulfilled',
          err: false,
          data: notifications
        })
      );
    } else {
      dispatch(
        getNotifications({
          status: 'fulfilled',
          err: true,
          data: notifications
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
