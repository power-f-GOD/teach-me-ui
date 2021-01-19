import { ModalState } from '../types';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export const NOTIFICATIONS = 'NOTIFICATIONS';

export const MAKE_POST = 'MAKE_POST';

export const MAKE_REPOST = 'MAKE_REPOST';

export const SELECT_PHOTO = 'SELECT_PHOTO';
export const EDIT_PROFILE = 'EDIT_PROFILE';

export const CREATE_QUESTION = 'CREATE_QUESTION';
export const CREATE_ANSWER = 'CREATE_ANSWER';

export const modalState: ModalState = {
  open: false,
  type: MAKE_POST,
  meta: { title: 'Make Post' }
};
