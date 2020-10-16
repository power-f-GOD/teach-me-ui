import { showModal, hideModal, setLastseen } from '../actions';
import { getState } from '../appStore';
import { dispatch } from './utils';

export const displayModal = (
  visibility: boolean,
  notification: boolean = false,
  type?: string,
  meta?: { [key: string]: any },
) => {
  const notificationId = getState().getNotifications.data.notifications[0] ? getState().getNotifications.data.notifications[0]._id : '';
  if (notification && getState().getNotifications.data.notifications[0]) setLastseen(notificationId);
  if (visibility) {
    return dispatch(showModal({ type, meta }));
  }
  return dispatch(hideModal());
};
