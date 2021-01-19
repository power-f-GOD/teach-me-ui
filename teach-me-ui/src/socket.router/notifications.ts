import { dispatch } from '../functions';

import { getNotificationsRequest } from '../actions';

import { SocketPipe } from '../types';
import { getConversations } from '../actions/main/chat';

export default function notifications(data: any) {
  try {
    switch (data.pipe as SocketPipe) {
      case 'PING_USER':
        dispatch(getNotificationsRequest(Date.now())(dispatch));

        if (data.data?.type === 'NEW_CONVERSATION') {
          dispatch(getConversations('settled')(dispatch));
        }
        break;
      default:
        break;
    }
  } catch (e) {}
}
