import { GET_NOTIFICATIONS, notificationState } from '../constants';
import { ReduxAction, NotificationState } from '../types';

export const getNotifications = (
  state: NotificationState = notificationState,
  action: ReduxAction
) => {
  if (action.type === GET_NOTIFICATIONS) {
    return {
      ...state,
      ...action.payload
    };
  }
  return state;
};
