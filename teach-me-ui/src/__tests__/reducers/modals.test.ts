import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  ModalState,
  modalState,
  SHOW_MODAL,
  HIDE_MODAL
} from '../../constants';
import { modal } from '../../reducers/modals';

afterEach(cleanup);

it("modals reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockModalState: ModalState = {
    open: expect.any(Boolean),
    type: expect.any(String),
    meta: { title: expect.any(String) }
  };
  const showModalAction: ReduxAction = {
    type: SHOW_MODAL,
    payload: {
      ...modalState,
      open: true,
      type: 'CREATE_POST',
      meta: { title: 'Create Post' }
    }
  };
  const showModalMockFunc = jest.fn((state: ModalState, action: ReduxAction) =>
    modal(state, action)
  );

  const hideModalAction: ReduxAction = {
    type: HIDE_MODAL,
    payload: {
      ...modalState,
      open: false
    }
  };
  const hideModalMockFunc = jest.fn((state: ModalState, action: ReduxAction) =>
    modal(state, action)
  );

  showModalMockFunc(modalState, showModalAction);
  expect(showModalMockFunc).toHaveBeenCalledWith(modalState, showModalAction);
  expect(modal(modalState, showModalAction)).toMatchObject(mockModalState);

  hideModalMockFunc(modalState, hideModalAction);
  expect(hideModalMockFunc).toHaveBeenCalledWith(modalState, hideModalAction);
  expect(modal(modalState, hideModalAction)).toMatchObject(mockModalState);
});