import { dispatch } from '../functions';

import { getNotifications, deepProfileData } from '../actions';

import { PingUserProps } from '../types';
import { getConversations } from '../actions/main/chat';
import {
  IS_COLLEAGUE,
  AWAITING_REQUEST_ACTION,
  PENDING_REQUEST,
  NOT_COLLEAGUES
} from '../constants';

export default function notifications(_data: PingUserProps) {
  const { data } = _data;
  const { type, payload } = data ?? {};
  const { request_id } = payload || {};

  try {
    switch (type) {
      case IS_COLLEAGUE:
      case NOT_COLLEAGUES:
      case 'NEW_CONVERSATION':
        dispatch(getConversations('settled'));

        if (type === 'NEW_CONVERSATION') break;
      //eslint-disable-next-line
      case AWAITING_REQUEST_ACTION:
      case PENDING_REQUEST:
        if (payload) {
          const correspondingType = /AWAITING/.test(type)
            ? PENDING_REQUEST
            : /PENDING/.test(type)
            ? AWAITING_REQUEST_ACTION
            : type;

          dispatch(
            deepProfileData({
              data: { status: correspondingType, request_id }
            })
          );
        }
        break;
      default:
        break;
    }

    dispatch(getNotifications(Date.now())(dispatch));
  } catch (e) {}
}
