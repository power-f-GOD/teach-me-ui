import { cleanup } from '@testing-library/react';

import { 
  ReduxAction, 
  ModalState, 
  CREATE_POST 
} from '../../constants';
import { 
  hideModal, 
  showModal 
} from '../../actions';

afterEach(cleanup);

it("creates modals (inputs) action and should be called with its 'state props' and return action.", () => {
  const mockModalState: ModalState = {
    open: expect.any(Boolean),
    type: expect.any(String),
    meta: { title: expect.any(String) }
  };

  const showModalAction: ReduxAction = {
    type: expect.any(String),
    payload: {
      open: true,
      type: CREATE_POST,
      meta: { title: 'Create Post' }
    }
  };
  const hideModalAction: ReduxAction = {
    type: expect.any(String),
    payload: {
      open: true
    }
  };
  const showModalMockFunc = jest.fn((payload: ModalState) => {
    showModal(payload);
    hideModal(payload);
  });

  showModalMockFunc(mockModalState);
  expect(showModalMockFunc).toHaveBeenCalledWith(mockModalState);
  expect(showModal(mockModalState)).toMatchObject(showModalAction);
  expect(hideModal(mockModalState)).toMatchObject(hideModalAction);
});
