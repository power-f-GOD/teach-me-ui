import queryString from 'query-string';

import { ONLINE_STATUS } from '../constants/misc';
import { dispatch } from '../functions/utils';
import { conversationInfo } from '../actions/chat';

export default function misc(message: any) {
  const { cid } = queryString.parse(window.location.search) ?? {};
  const { pipe, user_id, conversation_id, online_status } = message;

  switch (pipe) {
    case ONLINE_STATUS:
      if (user_id && cid === conversation_id) {
        dispatch(conversationInfo({ isOnline: !!online_status }));
      }
      break;
  }
}
