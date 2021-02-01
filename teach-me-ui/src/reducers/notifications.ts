import { SET_NOTIFICATIONS, notificationState } from '../constants';
import { ReduxAction, NotificationState } from '../types';

export const notifications = (
  state: NotificationState = notificationState,
  action: ReduxAction
) => {
  if (action.type === SET_NOTIFICATIONS) {
    return {
      ...state,
      ...action.payload,
      data: { ...state.data, ...action.payload.data }
    };
  }
  return state;
};
