// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock.ts';

import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/notifications';
import { NotificationState, GET_NOTIFICATIONS, GET_NOTIFICATIONS_REQUEST, ReduxAction } from '../../constants';


afterEach(cleanup);

it("gets users notifications and displays it to the user", () => {
  const mockNotificationState: NotificationState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Array)
  };
  const mockDate = expect.any(Number)
  
  const getNotificationsAction: ReduxAction = {
    type: GET_NOTIFICATIONS,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Array)
    }
  };

  const getNotificationsRequestAction: ReduxAction = {
    type: GET_NOTIFICATIONS_REQUEST,
    newState: expect.any(Number)
  };

  const getNotificationsRequestMockFunc = jest.fn((date: number) => {
    return (dispatch: Function) => {
      actions.getNotifications(mockNotificationState);
    }
  });

  getNotificationsRequestMockFunc(mockDate);
  expect(getNotificationsRequestMockFunc).toHaveBeenCalledWith(mockDate);
  expect(actions.getNotifications(mockNotificationState)).toMatchObject(getNotificationsAction);
  // expect(actions.getNotificationsRequest(mockDate)).toMatchObject(getNotificationsRequestAction);
});