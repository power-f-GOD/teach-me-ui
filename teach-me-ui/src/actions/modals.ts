import { ReduxAction, SHOW_MODAL, HIDE_MODAL, ModalState } from '../constants';

export const showModal: Function = (
  payload: Partial<ModalState> = {}
): ReduxAction => {
  return { type: SHOW_MODAL, payload: { open: true, ...payload } };
};

export const hideModal: Function = (
  payload: Partial<ModalState> = {}
): ReduxAction => {
  return { type: HIDE_MODAL, payload: { open: false, ...payload } };
};
