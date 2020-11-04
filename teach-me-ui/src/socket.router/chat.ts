import queryString from 'query-string';

import {
  APIMessageResponse,
  UserData,
  APIConversationResponse
} from '../constants/interfaces';
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
  conversations,
  conversation,
  conversationsMessages
} from '../actions/chat';

let userTypingTimeout: any = null;
let conversationTypingTimeouts: any = {};

export default function chat(message: APIMessageResponse & UserData) {
  const {
    webSocket: socket,
    userData,
    conversation: _conversation,
    conversationMessages: _conversationMessages
  } = getState();
  const { _id: convoId, unread_count } =
    _conversation ?? ({} as APIConversationResponse);
  const { cid, chat } = queryString.parse(window.location.search) ?? {};
  const userId = userData.id;
  const [isOpen, isMinimized] = [!!chat, chat === 'm2'];

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
    const type = sender_id === userId ? 'outgoing' : 'incoming';

    //if state to be removed when typing is added and handled
    if (pipe !== CHAT_TYPING) {
      dispatch(conversations({ data: [{ ...message }] }));
      dispatch(
        conversationsMessages({
          pipe,
          statusText: 'update from socket',
          data: { [conversation_id]: [{ ...message }] }
        })
      );
    }

    switch (pipe) {
      case CHAT_NEW_MESSAGE:
        let willEmitDelivered = false;
        let willEmitSeen = false;

        if (socket.readyState === 1) {
          if (type === 'incoming') {
            const delivered = delivered_to!?.includes(userId);
            const seen = seen_by!?.includes(userId);

            if (delivered_to && !delivered) {
              socket.send(
                JSON.stringify({
                  message_id: _id,
                  pipe: CHAT_MESSAGE_DELIVERED
                })
              );
              willEmitDelivered = true;
            }

            if (
              userData.online_status === 'ONLINE' &&
              isOpen &&
              !isMinimized &&
              cid === conversation_id &&
              seen_by &&
              !seen
            ) {
              willEmitSeen = true;
              socket.send(
                JSON.stringify({
                  message_id: message._id,
                  pipe: CHAT_READ_RECEIPT
                })
              );
            } else {
              if (convoId === conversation_id && convoId) {
                updateConversation(convoId, {
                  unread_count: unread_count + 1
                });
              }
            }
          } else {
            if (convoId === conversation_id && convoId) {
              updateConversation(convoId, {
                last_read: message.date,
                unread_count: 0
              });
            }
          }

          //update only last_read for conversations (and not conversation) in state (to avoid bugs)
          dispatch(
            conversations({
              data: [{ _id: convoId, last_read: message.date }]
            })
          );
        }

        if (convoId && conversation_id === convoId) {
          dispatch(
            conversationMessages({
              statusText: 'from socket',
              data: [
                {
                  ...message,
                  delivered_to: willEmitDelivered ? [userId] : [],
                  seen_by: willEmitSeen ? [userId] : []
                }
              ]
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
          }, 500);
        }

        clearTimeout(conversationTypingTimeouts[user_id as string]);
        dispatch(
          conversations({ data: [{ ...message, user_typing: user_id }] })
        );
        conversationTypingTimeouts[user_id as string] = setTimeout(() => {
          dispatch(conversations({ data: [{ ...message, user_typing: '' }] }));
        }, 500);
        break;
      //deliberately not using a break keyword after this
      case CHAT_MESSAGE_DELETED_FOR:
        if (convoId === conversation_id && convoId) {
          updateConversation(convoId, {
            unread_count: 0,
            last_read: _conversationMessages.data.slice(-1)[0].date
          });
        }
      //eslint-disable-next-line
      case CHAT_MESSAGE_DELETED:
        if (deleted && convoId && conversation_id === convoId) {
          dispatch(
            conversationMessages({
              statusText: 'from socket',
              pipe,
              data: [{ deleted: true, _id }]
            })
          );
        }

        // dispatch(
        //   conversationsMessages({
        //     pipe,
        //     statusText: 'update from socket',
        //     data: { [conversation_id]: [message] }
        //   })
        // );
        break;
    }
  }
}

function updateConversation(
  convoId: string,
  data: Partial<APIConversationResponse>
) {
  dispatch(conversation(convoId, { ...data }));
  dispatch(
    conversations({
      data: [{ _id: convoId, ...data }]
    })
  );
}
