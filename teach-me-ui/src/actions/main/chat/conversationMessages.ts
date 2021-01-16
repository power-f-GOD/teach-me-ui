import {
  ChatState,
  ConversationMessages,
  APIMessageResponse,
  APIConversationResponse,
  UserData,
  ConversationsMessages,
  LoopFind,
  FetchState,
  APIResponseModel
} from '../../../types';
import {
  GET_CONVERSATION_MESSAGES,
  SET_CONVERSATION_MESSAGES,
  CHAT_MESSAGE_DELIVERED,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_NEW_MESSAGE
} from '../../../constants/chat';
import {
  logError,
  getState,
  checkNetworkStatusWhilstPend,
  delay,
  loopThru,
  http
} from '../../../functions';
import { displaySnackbar } from '../../misc';
import { conversationsMessages, conversations, conversation } from '.';

export const getConversationMessages = (
  convoId: string,
  status?: 'settled' | 'pending' | 'fulfilled',
  _statusText?: string,
  offset?: number
) => (dispatch: Function) => {
  //put/call async function inside a closure to prevent the redux-async functions ish
  (async () => {
    const {
      userData,
      conversationsMessages: _conversationsMessages,
      conversation: _conversation,
      webSocket: socket,
      chatState
    } = getState() as {
      userData: UserData;
      conversationsMessages: ConversationsMessages;
      conversation: APIConversationResponse;
      conversations: FetchState<APIConversationResponse[]>;
      webSocket: WebSocket;
      chatState: ChatState;
    };
    const { id: userId } = userData;
    const cachedConvoMessages = _conversationsMessages.data![convoId] ?? [];
    const isGettingNew = /new/.test(_statusText ?? '');
    const isUpdating = /updat(ing|e)/.test(_statusText ?? '');
    const limit = 20;
    const hasCachedData = cachedConvoMessages.length;

    dispatch(
      conversationMessages({
        status: status ? status : 'pending',
        statusText: _statusText
          ? _statusText
          : "Don't remove this prop to avoid the scroll to bottom bug."
      })
    );
    checkNetworkStatusWhilstPend({
      name: 'conversationMessages',
      func: conversationMessages
    });

    try {
      const response = { error: false, data: [] } as APIResponseModel<
        Partial<APIMessageResponse>[]
      >;

      if (hasCachedData && (isGettingNew || isUpdating)) {
        response.data = cachedConvoMessages;
        response.error = false;

        if (!isUpdating) {
          //ensure to await a few milliseconds so previous states are set before proceeding to avoid bugs
          await delay(100);
        }
      } else {
        const { error, data: messages } = await http.get<APIMessageResponse[]>(
          `/conversations/${convoId}/messages?limit=${limit}${`&offset=${
            offset
              ? offset
              : hasCachedData
              ? cachedConvoMessages[0].date
              : Date.now()
          }`}`,
          true
        );

        response.data = messages ?? [];
        response.error = error;
      }

      const error = response.error;
      let messages = [...response.data] as APIMessageResponse[];
      const { isOpen, queryParam } = chatState;
      const isMinimized =
        window.innerWidth < 992 && queryParam?.slice(1) === '0' ? true : false;
      const statusText = _statusText
        ? messages.length
          ? _statusText
          : 'reached end'
        : undefined;
      let hasReachedLastRead = false;

      if (error) {
        dispatch(
          conversationMessages({
            convoId,
            status: 'settled',
            statusText,
            err: true,
            data: []
          })
        );

        if (isGettingNew) {
          dispatch(
            conversationsMessages({
              convoId,
              status: 'settled',
              err: true,
              statusText
            })
          );
        }
      } else {
        if (socket && socket.readyState === socket.OPEN) {
          messages = loopThru(
            messages,
            (_message) => {
              const message = _message.seen_by
                ? { ..._message, seen_by: [..._message.seen_by] }
                : ({ ..._message } as APIMessageResponse); // attempt to fix 'object inextensible bug' by copying

              const type =
                message.sender_id === userId || !message.sender_id
                  ? 'outgoing'
                  : 'incoming';

              if (message.date >= _conversation?.last_read!) {
                hasReachedLastRead = true;
              }

              if (hasReachedLastRead) {
                dispatch(
                  conversations({
                    data: [{ id: convoId, last_read: message.date }]
                  })
                );

                if (type === 'outgoing') {
                  dispatch(conversation(convoId, { last_read: message.date }));
                }
              }

              if (type === 'incoming') {
                if (message.seen_by!?.includes(userId)) {
                  return;
                }

                if (!message.delivered_to!?.includes(userId)) {
                  socket.send(
                    JSON.stringify({
                      message_id: message.id,
                      pipe: CHAT_MESSAGE_DELIVERED
                    })
                  );
                  message.delivered_to.push(userId);
                }

                if (!message.seen_by!?.includes(userId)) {
                  if (convoId === message.conversation_id) {
                    if (isOpen && !isMinimized) {
                      socket.send(
                        JSON.stringify({
                          message_id: message.id,
                          pipe: CHAT_READ_RECEIPT
                        })
                      );
                      message.seen_by.push(userId);
                    }
                  }
                }
              }
            },
            { returnReverse: !(hasCachedData && isGettingNew) }
          ) as APIMessageResponse[];
        }
      }

      dispatch(
        conversationMessages({
          convoId,
          status: 'fulfilled',
          err: false,
          statusText,
          data: messages
        })
      );

      if ((isGettingNew || isUpdating) && convoId) {
        dispatch(
          conversationsMessages({
            convoId,
            status: 'fulfilled',
            err: false,
            statusText: 'replace messages',
            data: {
              [convoId]: messages
            }
          })
        );
      }

      //hide Snackbar in case it's currently displayed (due to an error event)
      dispatch(displaySnackbar({ timeout: 1000 }));
    } catch (e) {
      logError(conversationMessages)(e);
    }
  })();

  return {
    type: GET_CONVERSATION_MESSAGES
  };
};

export const conversationMessages = (payload: ConversationMessages) => {
  const { conversation, conversationMessages } = getState() as {
    conversation: APIConversationResponse;
    conversationMessages: ConversationMessages;
  };
  let [previousMessages, convoId] = [
    (conversationMessages.data as Partial<APIMessageResponse>[]) ?? [],
    conversation.id
  ];

  if (!payload.pipe) {
    if (payload.data?.length && payload.data![0]?.conversation_id === convoId) {
      if (/offset|end/.test(payload.statusText as string)) {
        if (
          previousMessages.length &&
          payload.data[0].id !== previousMessages[0].id
        ) {
          previousMessages.unshift(...payload.data);
        }
      } else {
        if (payload.data![0]?.date! >= previousMessages.slice(-1)[0]?.date!) {
          previousMessages.push(...payload.data);
        } else {
          previousMessages.unshift(...payload.data);
        }
      }
    }
  } else {
    // console.log('payload:', payload);
    const messageId = payload.data![0].id;
    let { value, index: indexOfInitial } = (loopThru(
      previousMessages,
      (message) => message.id === messageId,
      {
        type: 'find',
        includeIndex: true,
        rightToLeft: true,
        makeCopy: true
      }
    ) ?? {}) as LoopFind<APIMessageResponse>;
    const initialMessage = value
      ? { ...value, seen_by: [...value.seen_by] }
      : (null as APIMessageResponse | null); // attempt to fix 'object inextensible bug' by copying

    if (payload.data?.length === 1) {
      switch (payload.pipe) {
        case CHAT_NEW_MESSAGE:
          const newMessage = payload.data[0];
          const isOutgoingMessage = !!payload.data[0]?.timestamp_id;

          if (isOutgoingMessage) {
            const indexOfInitial = loopThru(
              previousMessages,
              (message) =>
                message.timestamp_id &&
                message.timestamp_id === newMessage.timestamp_id,
              { type: 'findIndex', rightToLeft: true }
            ) as number;

            if (indexOfInitial > -1) {
              delete newMessage.timestamp_id;
              previousMessages[indexOfInitial] = newMessage;
            } else {
              previousMessages.push(newMessage);
            }
          } else {
            previousMessages.push(newMessage);
          }

          break;
        case CHAT_MESSAGE_DELIVERED:
          const deliveeId = payload.data![0].delivered_to![0];

          if (
            initialMessage &&
            !initialMessage.delivered_to!?.includes(deliveeId) &&
            deliveeId
          ) {
            initialMessage.delivered_to.push(deliveeId);
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_READ_RECEIPT:
          const seerId = payload.data![0].seen_by![0];

          if (
            initialMessage &&
            !initialMessage.seen_by!?.includes(seerId) &&
            seerId
          ) {
            // console.log('initial message:', initialMessage);
            initialMessage.seen_by.push(seerId);
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_MESSAGE_DELETED:
          if (initialMessage && !initialMessage.deleted) {
            initialMessage.deleted = true;
            initialMessage.message = '';
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_MESSAGE_DELETED_FOR:
          if (initialMessage) {
            initialMessage.deleted = true;
            initialMessage.message = '';
            previousMessages.splice(indexOfInitial, 1);
          }
          break;
      }
    }
  }

  const resultingPayload = {
    ...payload,
    data: [
      ...(payload.data?.length || (payload.status !== 'pending' && convoId)
        ? previousMessages
        : [])
    ]
  };

  return {
    type: SET_CONVERSATION_MESSAGES,
    payload: resultingPayload
  };
};
