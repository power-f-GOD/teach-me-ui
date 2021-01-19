import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/notifications';
import { GET_NOTIFICATIONS, GET_NOTIFICATIONS_REQUEST } from '../../constants';
import { NotificationState, ReduxAction } from '../../types';

afterEach(cleanup);

it('gets users notifications and displays it to the user', () => {
  const mockNotificationState: NotificationState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };
  const mockDate = expect.any(Number);

  const getNotificationsAction: ReduxAction = {
    type: GET_NOTIFICATIONS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const getNotificationsRequestAction: ReduxAction = {
    type: GET_NOTIFICATIONS_REQUEST,
    newState: expect.any(Number)
  };

  const getNotificationsRequestMockFunc = jest.fn((date: number) => {
    return (dispatch: Function) => {
      actions.getNotifications(mockNotificationState);
    };
  });

  getNotificationsRequestMockFunc(mockDate);
  expect(getNotificationsRequestMockFunc).toHaveBeenCalledWith(mockDate);
  expect(actions.getNotifications(mockNotificationState)).toMatchObject(
    getNotificationsAction
  );
  // expect(actions.getNotificationsRequest(mockDate)).toMatchObject(getNotificationsRequestAction);
});
