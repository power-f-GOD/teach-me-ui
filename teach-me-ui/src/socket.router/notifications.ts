import { dispatch } from '../functions';

import { getNotificationsRequest } from '../actions';

import { SocketPipe } from '../constants';

export default function notifications(data: any) {
  try {
    switch (data.pipe as SocketPipe) {
      case 'PING_USER':
        dispatch(getNotificationsRequest(Date.now())(dispatch));
        break;
      default:
        break;
    }
  } catch (e) {}
}
