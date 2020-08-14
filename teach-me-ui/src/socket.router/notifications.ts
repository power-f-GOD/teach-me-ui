import { dispatch } from '../functions';

import { getNotificationsRequest} from '../actions';

import { SocketPipe } from '../constants';

export default function notificationsRouter(data: any) {
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
