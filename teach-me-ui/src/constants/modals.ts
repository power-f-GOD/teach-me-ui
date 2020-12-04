import { ModalState } from './interfaces';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';
export const NOTIFICATIONS = 'NOTIFICATIONS';
export const CREATE_POST = 'CREATE_POST';
export const CREATE_REPOST = 'CREATE_REPOST';
export const SELECT_PHOTO = 'SELECT_PHOTO';
export const EDIT_PROFILE = 'EDIT_PROFILE';
export const CREATE_QUESTION = 'CREATE_QUESTION';
export const CREATE_ANSWER = 'CREATE_ANSWER';

export const modalState: ModalState = {
  open: false,
  type: CREATE_POST,
  meta: { title: 'Create Post' }
};
