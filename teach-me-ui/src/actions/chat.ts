import produce from 'immer';

import {
  ReduxAction,
  ChatState,
  ConversationMessages,
  APIMessageResponse,
  APIConversationResponse,
  UserData,
  ConversationsMessages,
  LoopFind,
  FetchState,
  APIResponseModel
} from '../constants/interfaces';
import {
  SET_CHAT_STATE,
  GET_CONVERSATIONS,
  SET_CONVERSATIONS,
  GET_CONVERSATION_MESSAGES,
  SET_CONVERSATION,
  SET_CONVERSATION_MESSAGES,
  CHAT_MESSAGE_DELIVERED,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_NEW_MESSAGE,
  CHAT_TYPING,
  SET_CONVERSATIONS_MESSAGES,
  GET_CONVERSATIONS_MESSAGES
} from '../constants/chat';
import { ONLINE_STATUS } from '../constants/misc';
import {
  logError,
  getState,
  callNetworkStatusCheckerFor,
  delay,
  loopThru,
  getData
} from '../functions';
import { dispatch } from '../appStore';
import { displaySnackbar } from './misc';

export const getConversations = (
  status?: 'pending' | 'settled' | 'fulfilled'
) => (dispatch: Function) => {
  dispatch(conversations({ status: status ? status : 'pending', err: false }));
  callNetworkStatusCheckerFor({
    name: 'conversations',
    func: conversations
  });

  getData<APIConversationResponse[]>('/conversations?limit=20&offset=', true)
    .then(({ error, data: _conversations }) => {
      if (error) {
        return dispatch(
          conversations({ status: 'fulfilled', err: true, data: [] })
        );
      }

      dispatch(
        conversations({
          status: 'fulfilled',
          err: false,
          data: [..._conversations]
        })
      );

      // add last message for every conversation in state in order for to display a message (in ScrollView) before load of other messages when a conversation is just opened
      if (_conversations.length) {
        for (const convo of _conversations) {
          const {
            conversationsMessages: _conversationMessages
          } = getState() as { conversationsMessages: ConversationsMessages };
          const convoMessages = _conversationMessages.data![convo.id!];

          if (convo.last_message) {
            if (!convoMessages?.length && convo.id) {
              dispatch(
                conversationsMessages({
                  statusText: 'replace messages',
                  data: { [convo.id]: [convo.last_message as any] }
                })
              );
            }
          }
        }
      }

      //hide Snackbar in case it's currently displayed (due to an error event)
      dispatch(displaySnackbar({ timeout: 1000 }));
    })
    .catch(logError(conversations));

  return {
    type: GET_CONVERSATIONS
  };
};

export const conversations = (
  _payload: FetchState<Partial<APIConversationResponse>[]>
): ReduxAction => {
  const payload = { ..._payload };
  const message = (((payload.data ?? [])[0] ??
    {}) as unknown) as APIMessageResponse;
  const { pipe, colleague, unread_count, user_typing, id, user_id, last_read } =
    (payload.data ?? [])[0] ?? {};
  const { online_status, last_seen } = colleague ?? {};
  const {
    conversation: _conversation,
    conversations,
    conversationMessages,
    userData
  } = getState() as {
    conversation: APIConversationResponse;
    conversations: FetchState<APIConversationResponse[]>;
    conversationMessages: ConversationMessages;
    userData: UserData;
  };
  const [initialConversations, convoMessages] = [
    conversations.data ?? [],
    conversationMessages.data ?? []
  ];
  const convoId = pipe ? message.conversation_id : id;

  if (pipe && initialConversations.length) {
    switch (pipe) {
      case ONLINE_STATUS: {
        const {
          value: actualConvo,
          index: indexOfInitial
        } = (loopThru<APIConversationResponse>(
          initialConversations,
          ({ colleague }) => user_id === colleague.id,
          {
            type: 'find',
            includeIndex: true
          }
        ) || {}) as LoopFind<APIConversationResponse>;

        if (actualConvo) {
          if (online_status === 'AWAY') {
            actualConvo.colleague.last_seen = last_seen!;
          }

          actualConvo.colleague.online_status = online_status!;
          initialConversations[indexOfInitial] = actualConvo;
          payload.data = initialConversations;
        } else {
          payload.data = [...initialConversations];
        }
        break;
      }
      case CHAT_TYPING:
      case CHAT_NEW_MESSAGE:
      case CHAT_READ_RECEIPT:
      case CHAT_MESSAGE_DELETED:
      case CHAT_MESSAGE_DELETED_FOR:
      case CHAT_MESSAGE_DELIVERED: {
        const {
          value: actualConvo,
          index: indexOfInitial
        } = (loopThru<APIConversationResponse>(
          initialConversations,
          ({ id }) => message?.conversation_id === id,
          {
            type: 'find',
            includeIndex: true
          }
        ) ?? {}) as LoopFind<APIConversationResponse>;

        if (actualConvo) {
          const last_message = (produce(
            { ...actualConvo.last_message, ...message },
            (draft: Partial<APIMessageResponse>) => {
              const { delivered_to, seen_by, deleted } = message;

              delete draft.timestamp_id;
              draft.delivered_to = delivered_to
                ? Array.isArray(delivered_to)
                  ? [...delivered_to]
                  : [delivered_to]
                : draft.delivered_to;
              draft.seen_by = seen_by
                ? Array.isArray(seen_by)
                  ? [...seen_by]
                  : [seen_by]
                : draft.seen_by;
              draft.deleted = deleted !== undefined ? deleted : false;
            }
          ) as unknown) as APIMessageResponse;

          if (pipe === CHAT_NEW_MESSAGE) {
            if (userData.id !== message.sender_id) {
              actualConvo.unread_count!++;
            }

            actualConvo.new_message = { ...last_message };
            actualConvo.last_message = { ...last_message };
            actualConvo.last_message.is_recent = true; // used for reordering LeftPane convos
            initialConversations.splice(indexOfInitial, 1);
            initialConversations.unshift(actualConvo);

            //update current conversation
            if (_conversation.id === convoId) {
              dispatch(conversation(convoId!, { ...actualConvo }));
            }
          } else {
            if (
              actualConvo.last_message?.id === message.id &&
              /message_deleted/i.test(pipe)
            ) {
              switch (pipe) {
                case CHAT_MESSAGE_DELETED:
                  actualConvo.last_message = {
                    ...actualConvo.last_message,
                    deleted: true
                  } as any;
                  break;
                case CHAT_MESSAGE_DELETED_FOR:
                  if (convoId === message.conversation_id) {
                    actualConvo.last_message = {
                      ...convoMessages?.slice(-2)[0]
                    } as any;
                  }
                  break;
              }
            } else if (pipe === CHAT_TYPING) {
              actualConvo.user_typing = user_typing!;
              initialConversations[indexOfInitial] = actualConvo;
            } else if (actualConvo.last_message?.id === message.id) {
              actualConvo.last_message = { ...last_message };
              initialConversations[indexOfInitial] = actualConvo;
            }
          }

          payload.data = initialConversations;
        }
        break;
      }
    }
  } else if (_payload.data?.length) {
    if (pipe) {
      let {
        value: actualConvo,
        index: indexOfInitial
      } = (loopThru<APIConversationResponse>(
        initialConversations,
        ({ colleague }) => user_id === colleague.id,
        {
          type: 'find',
          includeIndex: true
        }
      ) ?? {}) as LoopFind<APIConversationResponse>;

      if (actualConvo && payload.data?.length === 1) {
        actualConvo = { ...actualConvo, ...message };
        initialConversations[indexOfInitial] = actualConvo;
        payload.data = initialConversations;
      } else {
        payload.data = [...initialConversations];
      }
    } else if (!initialConversations.length || _payload.data.length > 1) {
      payload.data = [..._payload.data];
    } else if (!payload?.status) {
      let {
        value: actualConvo,
        index: indexOfInitial
      } = (loopThru<APIConversationResponse>(
        initialConversations,
        ({ id }) => convoId === id,
        {
          type: 'find',
          includeIndex: true
        }
      ) ?? {}) as LoopFind<APIConversationResponse>;

      if (actualConvo) {
        actualConvo = { ...actualConvo, ...(payload.data ?? [{}])[0] };

        if (last_read) {
          actualConvo.last_read = last_read;
        }

        if (!isNaN(unread_count!)) {
          actualConvo.unread_count = unread_count!;

          if (convoId === actualConvo.id && convoMessages?.length) {
            actualConvo.last_read = convoMessages?.slice(-1)[0].date as number;
          }
        }

        initialConversations[indexOfInitial] = {
          ...actualConvo
        };
      }

      payload.data = initialConversations;
    }
  }

  return {
    type: SET_CONVERSATIONS,
    payload
  };
};

export const conversation = (
  convoId: string,
  data?: Partial<APIConversationResponse>,
  shouldUpdateAll?: boolean
): ReduxAction => {
  const { conversations, conversation } = getState() as {
    conversations: FetchState<APIConversationResponse[]>;
    conversation: APIConversationResponse;
  };
  const dataFromConvos =
    conversations.data?.find(({ id }) => convoId === id) ??
    ({} as APIConversationResponse);
  const dataFromConvo = conversation;
  let payload = {} as APIConversationResponse;

  if (!data) {
    payload = { ...dataFromConvos };
  } else {
    if (shouldUpdateAll) {
      payload = { ...dataFromConvos, ...data };
    } else {
      if (convoId === dataFromConvo.id) {
        payload = { ...dataFromConvos, ...dataFromConvo, ...data };
      } else {
        payload = { ...dataFromConvos, ...data };
      }
    }

    if (payload.colleague) {
      payload.colleague = {
        ...dataFromConvo.colleague,
        ...(data?.colleague ?? {})
      };
      payload.colleague.profile_photo = payload.colleague.profile_photo || '';
    }
  }
  // console.trace('payload.....', payload, data);
  return {
    type: SET_CONVERSATION,
    payload
  };
};

export const getConversationsMessages = (statusText?: string) => (
  dispatch: Function
) => {
  const {
    userData: { id: userId },
    webSocket: socket,
    conversation: _conversation,
    chatState
  } = getState() as {
    userData: UserData;
    webSocket: WebSocket;
    conversation: APIConversationResponse;
    chatState: ChatState;
  };
  const convoId = _conversation.id;
  const { isOpen, queryString } = chatState;
  const isMinimized = /chat=m2/.test(queryString || '');

  dispatch(
    conversationsMessages({
      status: 'pending',
      err: false,
      statusText: statusText ? statusText : 'getting !delivereds on app load.'
    })
  );
  callNetworkStatusCheckerFor({
    name: 'conversationsMessages',
    func: conversationsMessages
  });

  getData<{ [convoId: string]: APIMessageResponse[] }>(
    '/messages/!delivered',
    true
  )
    .then(({ error, data: mappedConvosMessages }) => {
      if (error) {
        return dispatch(
          conversationsMessages({
            status: 'settled',
            err: true,
            data: {}
          })
        );
      }

      const _convosMessages = mappedConvosMessages;
      const updatedConvosMessages = { ..._convosMessages };

      for (const key in updatedConvosMessages) {
        const convoMessages = loopThru(
          _convosMessages[key],
          (message) => {
            if (!message.delivered_to.includes(userId)) {
              if (socket) {
                socket.send(
                  JSON.stringify({
                    message_id: message.id,
                    pipe: CHAT_MESSAGE_DELIVERED
                  })
                );
                message.delivered_to.push(userId);
              }
            }

            if (!message.seen_by!.includes(userId)) {
              if (convoId === message.conversation_id) {
                if (socket && isOpen && !isMinimized) {
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

            return message;
          },
          { returnReverse: true }
        );

        (updatedConvosMessages as any)[key] = convoMessages;
      }

      dispatch(
        conversationsMessages({
          status: 'fulfilled',
          err: false,
          data: { ...updatedConvosMessages }
        })
      );
    })
    .catch(logError(conversationsMessages));

  return {
    type: GET_CONVERSATIONS_MESSAGES
  };
};

export const conversationsMessages = (
  _payload: ConversationsMessages
): ReduxAction => {
  const {
    conversationsMessages: _conversationsMessages,
    conversation: _conversation
  } = getState() as {
    conversationsMessages: ConversationsMessages;
    userData: UserData;
    conversation: APIConversationResponse;
  };
  const { data: newData, pipe } = _payload;
  const statusText = _payload.statusText || _conversationsMessages.statusText;
  const shouldReplace = /replace/.test(statusText || '');
  const isNew = /new/.test(statusText || '');
  const isUpdating = /updat(ing|e)/.test(statusText || '');
  const newDataIsEmpty = !Object.keys(newData ?? {}).length;

  const convoId = Object.keys(newData ?? {})[0];
  const { data: prevData } = _conversationsMessages || {};
  const prevConvoMessages =
    convoId && prevData && prevData![convoId]?.length
      ? [...prevData[convoId]]
      : [];
  const newConvoMessage = (newData
    ? (newData[convoId] ?? [])[0] ?? {}
    : {}) as APIMessageResponse;
  const payload = {
    ..._payload,
    data: { ...prevData }
  } as ConversationsMessages;

  if (!pipe) {
    if (convoId && !newDataIsEmpty) {
      for (const [_convoId, messages] of Object.entries(newData ?? {})) {
        //update conversationMessages for current/active/open conversation
        if (isUpdating && _convoId === _conversation.id) {
          dispatch(
            conversationMessages({
              statusText,
              data: [...messages]
            })
          );
        }

        if (shouldReplace) {
          payload.data = {
            ...payload.data,
            [_convoId]: [...messages]
          };
          break;
        } else {
          payload.data = {
            ...payload.data,
            [_convoId]: [
              ...(prevData![_convoId] || []),
              ...(isNew || isUpdating ? messages : [])
            ]
          };
        }
      }
    }
  } else {
    const { value: initialMessage, index } = (loopThru(
      [...prevConvoMessages],
      (message) => message.id === newConvoMessage.id,
      { type: 'find', includeIndex: true, rightToLeft: true, makeCopy: true }
    ) ?? {}) as LoopFind<APIMessageResponse>;

    if (initialMessage || pipe === CHAT_NEW_MESSAGE) {
      if (newConvoMessage.timestamp_id) {
        delete newConvoMessage.timestamp_id;
      }

      switch (pipe) {
        case CHAT_NEW_MESSAGE: {
          //see code after switch block for the update
          break;
        }
        case CHAT_MESSAGE_DELIVERED: {
          const deliveeId = newConvoMessage.delivered_to![0];

          if (
            initialMessage &&
            !initialMessage.delivered_to!?.includes(deliveeId) &&
            deliveeId
          ) {
            initialMessage.delivered_to?.push(deliveeId);
            prevConvoMessages[index] = initialMessage;
          }
          break;
        }
        case CHAT_READ_RECEIPT: {
          const seerId = newConvoMessage.seen_by![0];

          if (
            initialMessage &&
            !initialMessage.seen_by!?.includes(seerId) &&
            seerId
          ) {
            console.log('inextensible:', initialMessage, seerId);
            initialMessage.seen_by?.push(seerId);
            prevConvoMessages[index] = initialMessage;
          }
          break;
        }
        case CHAT_MESSAGE_DELETED:
          if (initialMessage && !initialMessage.deleted) {
            initialMessage.deleted = true;
            initialMessage.message = '';
            prevConvoMessages[index] = initialMessage;
          }
          break;
        case CHAT_MESSAGE_DELETED_FOR: {
          if (initialMessage) {
            initialMessage.deleted = true;
            initialMessage.message = '';
            prevConvoMessages.splice(index, 1);
          }
          break;
        }
      }

      payload.data = {
        ...prevData,
        [convoId]:
          pipe === CHAT_NEW_MESSAGE
            ? [...prevConvoMessages, newConvoMessage]
            : [...prevConvoMessages]
      };
    } else {
      payload.data = { ...prevData };
    }
  }

  return {
    type: SET_CONVERSATIONS_MESSAGES,
    payload
  };
};

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
    callNetworkStatusCheckerFor({
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
        const { error, data: messages } = await getData<APIMessageResponse[]>(
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
      const { isOpen, queryString } = chatState;
      const isMinimized = /chat=m2/.test(queryString || '');
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
            (message) => {
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

              if (message.seen_by!?.includes(userId)) return;

              if (type === 'incoming') {
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
            { returnReverse: !(hasCachedData && isGettingNew), makeCopy: true }
          ) as APIMessageResponse[];
        }

        dispatch(
          conversationMessages({
            convoId,
            status: 'fulfilled',
            err: false,
            statusText,
            data: [...messages]
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
                [convoId]: [...messages]
              }
            })
          );
        }
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
    let { value: initialMessage, index: indexOfInitial } = (loopThru(
      previousMessages,
      (message) => message.id === messageId,
      {
        type: 'find',
        includeIndex: true,
        rightToLeft: true,
        makeCopy: true
      }
    ) ?? {}) as LoopFind<APIMessageResponse>;

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

export const chatState = (payload: ChatState): ReduxAction => {
  return {
    type: SET_CHAT_STATE,
    payload
  };
};
