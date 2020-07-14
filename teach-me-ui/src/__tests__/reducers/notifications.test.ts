import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  NotificationState,
  notificationState,
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_REQUEST
} from '../../constants';
import { getNotifications } from '../../reducers/notifications';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock';

afterEach(cleanup);

it("notifications reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockNotificationState: NotificationState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Array)
  };

  const getNotificationsAction: ReduxAction = {
    type: GET_NOTIFICATIONS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Array)
    }
  };

  const getNotificationsMockFunc = jest.fn((state: NotificationState, action: ReduxAction) =>
    getNotifications(state, action)
  );

  const getNotificationsRequestAction: ReduxAction = {
    type: GET_NOTIFICATIONS_REQUEST,
    newState: expect.any(Number)
  };


  getNotificationsMockFunc(notificationState, getNotificationsRequestAction);
  expect(getNotificationsMockFunc).toHaveBeenCalledWith(notificationState, getNotificationsRequestAction);
  expect(getNotifications(notificationState, getNotificationsRequestAction)).toMatchObject(mockNotificationState);
});
