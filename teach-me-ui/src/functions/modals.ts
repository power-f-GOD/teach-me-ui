import { showModal, hideModal } from '../actions';
import { dispatch } from './utils';

export const displayModal = (
  visibility: boolean,
  type?: string,
  title?: string
) => {
  if (visibility) {
    return dispatch(showModal({ type, title }));
  }
  return dispatch(hideModal());
};
