import {
  APIMessageResponse,
  UserData,
  APIConversationResponse,
  FetchState,
  ChatSocketMessageResponse,
  NotificationSoundState
} from '../constants/interfaces';
import { getState, dispatch, promisedDispatch } from '../functions/utils';
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
  conversations,
  conversation,
  conversationsMessages
} from '../actions/chat';
import { triggerNotificationSound } from '../actions';
import {
  TONE_TYPE__INCOMING_MESSAGE,
  TONE_TYPE__OUTGOING_MESSAGE
} from '../constants';

let userTypingTimeout: any = null;
let conversationTypingTimeouts: any = {};

export default function chat(message: Partial<ChatSocketMessageResponse>) {
  const {
    webSocket: socket,
    userData,
    conversation: _conversation,
    conversationMessages: _conversationMessages,
    notificationSound
  } = getState() as {
    webSocket: WebSocket;
    userData: UserData;
    conversation: APIConversationResponse;
    conversationMessages: FetchState<APIMessageResponse[]>;
    notificationSound: NotificationSoundState;
  };
  const { id: convoId, unread_count } = _conversation ?? {};
  const { pathname, search } = window.location;
  const [cid, chat, activePaneIndex] = [
    pathname.split('/').slice(-1)[0],
    /\/chat/.test(pathname),
    +search.slice(1)
  ];
  const userId = userData.id;
  const [isOpen, isMinimized] = [chat, activePaneIndex !== 1];

  if (socket) {
    const {
      pipe,
      delivered_to,
      conversation_id,
      id: _id,
      sender_id,
      user_id,
      seen_by,
      deleted
    } = message;
    const type = sender_id === userId ? 'outgoing' : 'incoming';
    //will be used at very end to update conversationsMessages
    const convoMessagesData: any = {
      statusText: 'update from socket',
      pipe
    };

    switch (pipe) {
      case CHAT_NEW_MESSAGE:
        const toneType: NotificationSoundState['toneType'] =
          type === 'outgoing'
            ? TONE_TYPE__OUTGOING_MESSAGE
            : TONE_TYPE__INCOMING_MESSAGE;
        let willEmitDelivered = false;
        let willEmitSeen = false;

        if (socket.readyState === socket.OPEN) {
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
                  message_id: message.id,
                  pipe: CHAT_READ_RECEIPT
                })
              );

              // updateConversation(convoId, {
              //   unread_count: 0
              // });
            } else {
              if (convoId === conversation_id && convoId) {
                updateConversation(convoId, {
                  unread_count: unread_count + 1
                });
              }
            }
          } else {
            if (convoId === conversation_id && convoId) {
              // console.log(convoId)
              updateConversation(convoId, {
                last_read: message.date,
                unread_count: 0
              });
            }
          }

          //update only last_read for conversations (and not conversation) in state (to avoid bugs)
          dispatch(
            conversations({
              data: [{ id: convoId, last_read: message.date! }]
            })
          );
        }

        convoMessagesData.data = [
          {
            ...message,
            delivered_to: willEmitDelivered ? [userId] : [],
            seen_by: willEmitSeen ? [userId] : []
          }
        ];

        if (convoId && conversation_id === convoId) {
          dispatch(
            conversationMessages({
              ...convoMessagesData
            })
          );
        }

        if (notificationSound.isPlaying) {
          promisedDispatch(
            triggerNotificationSound({ play: false, isPlaying: false })
          ).then(() => {
            dispatch(triggerNotificationSound({ play: true, toneType }));
          });
        } else {
          dispatch(triggerNotificationSound({ play: true, toneType }));
        }

        break;
      case CHAT_MESSAGE_DELIVERED:
        if (delivered_to) {
          convoMessagesData.data = [{ delivered_to: [delivered_to], id: _id }];

          if (convoId && conversation_id === cid) {
            dispatch(
              conversationMessages({
                ...convoMessagesData
              })
            );
          }
        }
        break;
      case CHAT_READ_RECEIPT:
        if (seen_by) {
          convoMessagesData.data = [{ seen_by: [seen_by], id: _id }];

          if (convoId && conversation_id === cid) {
            dispatch(
              conversationMessages({
                ...convoMessagesData
              })
            );
          }
        }
        break;
      case CHAT_TYPING:
        clearTimeout(userTypingTimeout);

        if (user_id && cid === conversation_id) {
          dispatch(conversation(conversation_id!, { user_typing: user_id }));

          userTypingTimeout = setTimeout(() => {
            dispatch(conversation(conversation_id!, { user_typing: '' }));
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
            last_read: _conversationMessages.data?.slice(-1)[0]?.date
          });
        }
      //eslint-disable-next-line
      case CHAT_MESSAGE_DELETED:
        if (deleted) {
          convoMessagesData.data = [{ deleted: true, id: _id }];

          if (convoId && conversation_id === convoId) {
            dispatch(
              conversationMessages({
                ...convoMessagesData
              })
            );
          }
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

    //if state to be removed when typing is added and handled
    if (pipe !== CHAT_TYPING) {
      dispatch(conversations({ data: [{ ...message }] }));

      if (conversation_id) {
        dispatch(
          conversationsMessages({
            ...convoMessagesData,
            data: { [conversation_id]: [...convoMessagesData.data] }
          })
        );
      }
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
      data: [{ id: convoId, ...data }]
    })
  );
}
