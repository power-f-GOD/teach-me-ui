import queryString from 'query-string';

import { APIMessageResponse, UserData } from '../constants/interfaces';
import { getState, dispatch } from '../functions/utils';
import {
  CHAT_NEW_MESSAGE,
  CHAT_MESSAGE_DELIVERED,
  CHAT_READ_RECEIPT,
  CHAT_TYPING,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR
} from '../constants/chat';
import {
  conversationMessages,
  conversationInfo,
  conversations
} from '../actions/chat';

let userTypingTimeout: any = null;
let conversationTypingTimeouts: any = {};

export default function chat(message: APIMessageResponse & UserData) {
  const { webSocket: socket, userData, conversation } = getState();
  const { _id: convoId } = conversation ?? {};
  const { cid, chat } = queryString.parse(window.location.search) ?? {};
  const [isOpen, isMinimized] = [!!chat, chat === 'min'];

  if (socket) {
    const {
      pipe,
      delivered_to,
      conversation_id,
      _id,
      sender_id,
      user_id,
      seen_by,
      deleted
    } = message;

    //if state to be removed when typing is added and handled
    if (pipe !== CHAT_TYPING)
      dispatch(conversations({ data: [{ ...message }] }));

    switch (pipe) {
      case CHAT_NEW_MESSAGE:
        if (sender_id !== userData.id && socket.readyState === 1) {
          if (delivered_to && !delivered_to!?.includes(userData.id)) {
            socket.send(
              JSON.stringify({
                message_id: _id,
                pipe: CHAT_MESSAGE_DELIVERED
              })
            );
          }

          if (
            userData.online_status === 'ONLINE' &&
            isOpen &&
            !isMinimized &&
            cid === conversation_id &&
            seen_by &&
            !seen_by!?.includes(userData.id)
          ) {
            socket.send(
              JSON.stringify({
                message_id: message._id,
                pipe: CHAT_READ_RECEIPT
              })
            );
          }
        }

        if (convoId && conversation_id === cid) {
          dispatch(
            conversationMessages({
              statusText: 'from socket',
              data: [{ ...message }]
            })
          );
        }
        break;
      case CHAT_MESSAGE_DELIVERED:
        if (delivered_to && convoId && conversation_id === cid) {
          const deliveeId: any = delivered_to;

          dispatch(
            conversationMessages({
              statusText: 'from socket',
              pipe: CHAT_MESSAGE_DELIVERED,
              data: [{ delivered_to: [deliveeId], _id }]
            })
          );
        }
        break;
      case CHAT_READ_RECEIPT:
        if (seen_by && convoId && conversation_id === cid) {
          const seerId: any = seen_by;

          dispatch(
            conversationMessages({
              statusText: 'from socket',
              pipe: CHAT_READ_RECEIPT,
              data: [{ seen_by: [seerId], _id }]
            })
          );
        }
        break;
      case CHAT_TYPING:
        clearTimeout(userTypingTimeout);

        if (user_id && cid === conversation_id) {
          dispatch(conversationInfo({ user_typing: user_id }));
          userTypingTimeout = setTimeout(() => {
            dispatch(conversationInfo({ user_typing: '' }));
          }, 750);
        }

        clearTimeout(conversationTypingTimeouts[user_id as string]);
        dispatch(
          conversations({ data: [{ ...message, user_typing: user_id }] })
        );
        conversationTypingTimeouts[user_id as string] = setTimeout(() => {
          dispatch(conversations({ data: [{ ...message, user_typing: '' }] }));
        }, 750);
        break;
      case CHAT_MESSAGE_DELETED:
      case CHAT_MESSAGE_DELETED_FOR:
        if (deleted && convoId && conversation_id === cid) {
          dispatch(
            conversationMessages({
              statusText: 'from socket',
              pipe:
                pipe === CHAT_MESSAGE_DELETED
                  ? CHAT_MESSAGE_DELETED
                  : CHAT_MESSAGE_DELETED_FOR,
              data: [{ deleted: true, _id }]
            })
          );
        }
        break;
    }
  }
}
