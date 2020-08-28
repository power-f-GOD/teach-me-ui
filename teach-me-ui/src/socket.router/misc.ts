import queryString from 'query-string';

import { ONLINE_STATUS } from '../constants/misc';
import { dispatch, getState } from '../functions/utils';
import { conversationInfo, conversations } from '../actions/chat';
import { ConversationInfo } from '../constants';

export default function misc(message: any) {
  const { id } = queryString.parse(window.location.search) ?? {};
  const { data } = getState().conversationInfo as ConversationInfo;
  const { pipe, user_id, online_status, last_seen } = message;

  switch (pipe) {
    case ONLINE_STATUS:
      if (user_id === id) {
        dispatch(
          conversationInfo({
            online_status,
            status: 'fulfilled',
            err: false,
            data: {
              ...data,
              last_seen: last_seen ? last_seen : data?.last_seen
            }
          })
        );
      }

      if (getState().userData.id !== user_id) {
        dispatch(conversations({ data: [{ ...message }] }));
      }

      break;
  }
}