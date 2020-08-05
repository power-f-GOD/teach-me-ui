import { 
  GET_NOTIFICATIONS,
  ReduxAction,
  NotificationState,
  notificationState,
} from '../constants';


export const getNotifications = (
  state: NotificationState = notificationState,
  action: ReduxAction
) => {
  if (action.type === GET_NOTIFICATIONS) {
    return {
      ...state,
      ...action.payload
    };
  };
  return state;
};