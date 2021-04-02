import { modalState, SHOW_MODAL, HIDE_MODAL } from '../constants';
import { ModalState, ReduxAction } from '../types';

export const modal = (state: ModalState = modalState, action: ReduxAction) => {
  if (action.type === SHOW_MODAL) return { ...action.payload, open: true };
  else if (action.type === HIDE_MODAL)
    return { ...action.payload, open: false };
  else return state;
};
