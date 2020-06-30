import { ModalState } from './interfaces';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const modalState: ModalState = {
  open: false,
  type: 'CREATE_POST',
  title: 'Create Post'
};
