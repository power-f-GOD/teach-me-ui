import { showModal, hideModal } from '../actions';
import { dispatch } from './utils';

export const displayModal = (
  visibility: boolean,
  type?: string,
  meta?: { [key: string]: any }
) => {
  if (visibility) {
    return dispatch(showModal({ type, meta }));
  }
  return dispatch(hideModal());
};
