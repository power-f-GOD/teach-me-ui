import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  NotificationState,
  notificationState,
  GET_NOTIFICATIONS
} from '../../constants';
import { getNotifications } from '../../reducers/notifications';

afterEach(cleanup);

it("notifications reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockNotificationState: NotificationState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const getNotificationsAction: ReduxAction = {
    type: GET_NOTIFICATIONS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const getNotificationsMockFunc = jest.fn((state: NotificationState, action: ReduxAction) =>
    getNotifications(state, action)
  );

  getNotificationsMockFunc(notificationState, getNotificationsAction);
  expect(getNotificationsMockFunc).toHaveBeenCalledWith(notificationState, getNotificationsAction);
  expect(getNotifications(notificationState, getNotificationsAction)).toMatchObject(mockNotificationState);
});
