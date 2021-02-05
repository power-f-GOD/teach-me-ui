import { showModal, hideModal, setLastseen } from '../actions';
import { getState } from '../appStore';
import { dispatch } from '../utils';

export const displayModal = (
  visibility: boolean,
  isNotifications: boolean = false,
  type?: string,
  meta?: { [key: string]: any }
) => {
  // setLastseen();

  if (isNotifications) {
    const topNotif = getState().notifications.data.notifications[0];

    if (!topNotif?.seen) setLastseen();
  }

  if (visibility) {
    window.location.hash = '#modal';

    return dispatch(showModal({ type, meta }));
  }

  return dispatch(hideModal());
};
