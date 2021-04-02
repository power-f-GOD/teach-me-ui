import { cleanup } from '@testing-library/react';

import { notificationState, SET_NOTIFICATIONS } from '../../constants';
import { ReduxAction, NotificationState } from '../../types';
import { notifications } from '../../reducers/notifications';

afterEach(cleanup);

it("notifications reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockNotificationState: NotificationState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };

  const getNotificationsAction: ReduxAction = {
    type: SET_NOTIFICATIONS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const getNotificationsMockFunc = jest.fn(
    (state: NotificationState, action: ReduxAction) =>
      notifications(state, action)
  );

  getNotificationsMockFunc(notificationState, getNotificationsAction);
  expect(getNotificationsMockFunc).toHaveBeenCalledWith(
    notificationState,
    getNotificationsAction
  );
  expect(
    notifications(notificationState, getNotificationsAction)
  ).toMatchObject(mockNotificationState);
});
