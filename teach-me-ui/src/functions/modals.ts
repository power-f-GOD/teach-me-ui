import { showModal, hideModal } from '../actions';
import { dispatch } from './utils';

export const displayModal = (visibility: boolean, type?: string) => {
  console.log('jajaja');
  if (visibility) {
    return dispatch(showModal({ open: true, type }));
  }
  return dispatch(hideModal({ open: false }));
};
