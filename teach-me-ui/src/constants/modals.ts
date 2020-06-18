import { ModalState } from './interfaces';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const modalState: ModalState = {
  open: true,
  type: 'CREATE_POST'
};
