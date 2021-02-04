import { showModal, hideModal, setLastseen } from '../actions';
import { getState } from '../appStore';
import { dispatch } from '../utils';

export const displayModal = (
  visibility: boolean,
  notification: boolean = false,
  type?: string,
  meta?: { [key: string]: any }
) => {
  setLastseen();
  if (
    notification &&
    getState().notifications.data.notifications[0] &&
    !getState().notifications.data.notifications[0].seen
  )
    setLastseen();

  if (visibility) {
    return dispatch(showModal({ type, meta }));
  }

  if (/#modal/.test(window.location.hash)) {
    window.history.back();
  }

  return dispatch(hideModal());
};
