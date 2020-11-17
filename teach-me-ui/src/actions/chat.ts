import axios, { AxiosResponse } from 'axios';
import produce from 'immer';

import {
  ReduxAction,
  ChatState,
  SearchState,
  ConversationInfo,
  ConversationMessages,
  APIMessageResponse,
  APIConversationResponse,
  UserData,
  ConversationsMessages,
  LoopFind,
  SearchStateV2
} from '../constants/interfaces';
import {
  SET_CHAT_STATE,
  GET_CONVERSATIONS,
  SET_CONVERSATIONS,
  GET_CONVERSATION_MESSAGES,
  GET_CONVERSATION_INFO,
  SET_CONVERSATION_INFO,
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
import { apiBaseURL as baseURL, ONLINE_STATUS } from '../constants/misc';
import {
  logError,
  getState,
  callNetworkStatusCheckerFor,
  delay,
  loopThru
} from '../functions';
import { dispatch } from '../appStore';
import { displaySnackbar } from './misc';

interface ConversationsResponse {
  data: {
    error: boolean;
    conversations: Array<
      APIConversationResponse | Partial<APIConversationResponse>
    >;
  };
}

export const getConversations = (
  status?: 'pending' | 'settled' | 'fulfilled'
) => (dispatch: Function) => {
  const { token } = getState().userData as UserData;

  dispatch(conversations({ status: status ? status : 'pending', err: false }));
  callNetworkStatusCheckerFor({
    name: 'conversations',
    func: conversations
  });

  axios({
    url: `${baseURL}/conversations?limit=20&offset=`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then((response: AxiosResponse<ConversationsResponse>) => {
      const { error, conversations: _conversations } = response.data.data;

      if (!error) {
        dispatch(
          conversations({
            status: 'fulfilled',
            err: false,
            data: [..._conversations]
          })
        );

        // add last message for every conversation in state in order for to display a message before load of other messages when a conversation is just opened
        if (_conversations.length) {
          for (const convo of _conversations) {
            const {
              conversationsMessages: _conversationMessages
            } = getState() as { conversationsMessages: ConversationsMessages };
            const convoMessages = _conversationMessages.data![convo._id!];

            if (convo.last_message) {
              if (!convoMessages?.length && convo._id) {
                dispatch(
                  conversationsMessages({
                    statusText: 'replace messages',
                    data: { [convo._id]: [convo.last_message as any] }
                  })
                );
              }
            }
          }
        }
      } else {
        dispatch(conversations({ status: 'fulfilled', err: true, data: [] }));
      }

      //hide Snackbar in case it's currently displayed (due to an error event)
      dispatch(displaySnackbar({ timeout: 1000 }));
    })
    .catch(logError(conversations));

  return {
    type: GET_CONVERSATIONS
  };
};

export const conversations = (_payload: SearchState): ReduxAction => {
  const payload = { ..._payload };
  const {
    pipe,
    online_status,
    user_id,
    last_seen,
    unread_count,
    user_typing,
    _id,
    last_read
  } = (payload.data ?? [])[0] ?? {};
  const message = ((payload.data ?? [])[0] ?? {}) as APIMessageResponse;
  const { conversations, conversationMessages, userData } = getState() as {
    conversations: SearchState;
    conversationMessages: ConversationMessages;
    userData: UserData;
  };
  const [initialConversations, convoMessages] = [
    conversations.data ?? [],
    conversationMessages.data ?? []
  ];
  const convoId = pipe ? message.conversation_id : _id;

  if (pipe && initialConversations.length) {
    switch (pipe) {
      case ONLINE_STATUS: {
        const {
          value: actualConvo,
          index: indexOfInitial
        } = (loopThru(
          initialConversations,
          (conversation) => user_id === conversation?.associated_user_id,
          { type: 'find', includeIndex: true }
        ) || {}) as LoopFind<APIConversationResponse>;

        if (actualConvo) {
          if (online_status === 'AWAY') {
            actualConvo.last_seen = last_seen;
          }

          actualConvo.online_status = online_status;
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
        } = (loopThru(
          initialConversations,
          (conversation) => message?.conversation_id === conversation._id,
          { type: 'find', includeIndex: true }
        ) ?? {}) as LoopFind<APIConversationResponse>;

        if (actualConvo) {
          const last_message = (produce(
            { ...actualConvo.last_message, ...message },
            (draft: Partial<APIMessageResponse>) => {
              const { delivered_to, seen_by, deleted } = message;

              draft.timestamp_id = undefined;
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

            dispatch(conversationInfo({ new_message: { ...last_message } }));
            actualConvo.last_message = { ...last_message };
            actualConvo.last_message.is_recent = true;
            initialConversations.splice(indexOfInitial, 1);
            initialConversations.unshift(actualConvo);
          } else {
            if (
              actualConvo.last_message?._id === message._id &&
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
              actualConvo.user_typing = user_typing;
              initialConversations[indexOfInitial] = actualConvo;
            } else if (actualConvo.last_message?._id === message._id) {
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
      } = (loopThru(
        initialConversations,
        (conversation) => user_id === conversation.associated_user_id,
        { type: 'find', includeIndex: true }
      ) ?? {}) as LoopFind<APIConversationResponse>;

      if (actualConvo && payload.data?.length === 1) {
        actualConvo = { ...actualConvo, ...message };
        initialConversations[indexOfInitial] = actualConvo as Partial<
          APIConversationResponse
        >;
        payload.data = initialConversations;
      } else {
        payload.data = [...initialConversations];
      }
    } else if (!initialConversations.length || _payload.data.length > 1) {
      payload.data = [..._payload.data];
    } else if (!payload?.status) {
      const {
        value: actualConvo,
        index: indexOfInitial
      } = (loopThru(
        initialConversations,
        (conversation) => convoId === conversation._id,
        { type: 'find', includeIndex: true }
      ) ?? {}) as LoopFind<APIConversationResponse>;

      if (actualConvo) {
        if (last_read) {
          actualConvo.last_read = last_read;
        }

        if (!isNaN(unread_count)) {
          actualConvo.unread_count = unread_count;

          if (convoId === actualConvo._id && convoMessages?.length) {
            actualConvo.last_read = convoMessages?.slice(-1)[0].date as number;
          }
        }

        initialConversations[indexOfInitial] = { ...actualConvo } as Partial<
          APIConversationResponse
        >;
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
    conversations: SearchState;
    conversation: APIConversationResponse;
  };
  const dataFromConvos =
    conversations.data?.find(
      (conversation: APIConversationResponse) => convoId === conversation?._id
    ) ?? {};
  const dataFromConvo = conversation;
  let payload = {} as APIConversationResponse;

  if (convoId) {
    if (!data) {
      payload = { ...dataFromConvos };
    } else {
      if (shouldUpdateAll) {
        payload = { ...dataFromConvos, ...data };
      } else {
        if (convoId === dataFromConvo._id) {
          payload = { ...dataFromConvos, ...dataFromConvo, ...data };
        } else {
          payload = { ...dataFromConvos, ...data };
        }
      }
    }

    payload.profile_photo = payload.profile_photo || '';
  }

  return {
    type: SET_CONVERSATION,
    payload
  };
};

interface ConversationsMessagesResponse {
  data: {
    error: boolean;
    conversations: { [convoId: string]: APIMessageResponse[] };
  };
}

export const getConversationsMessages = (statusText?: string) => (
  dispatch: Function
) => {
  const {
    userData,
    webSocket: socket,
    conversation: _conversation,
    chatState
  } = getState() as {
    userData: UserData;
    webSocket: WebSocket;
    conversation: APIConversationResponse;
    chatState: ChatState;
  };
  const { token, id: userId } = userData as UserData;
  const convoId = _conversation._id;
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

  axios({
    url: `${baseURL}/messages/!delivered`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(({ data }: AxiosResponse<ConversationsMessagesResponse>) => {
      const _convosMessages = data.data.conversations;

      if (!data.data.error) {
        const updatedConvosMessages = _convosMessages;

        for (const key in updatedConvosMessages) {
          const convoMessages = loopThru(
            _convosMessages[key],
            (message) => {
              if (!message.delivered_to.includes(userId)) {
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      message_id: message._id,
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
                        message_id: message._id,
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
      } else {
        dispatch(
          conversationsMessages({
            status: 'settled',
            err: true,
            data: {}
          })
        );
      }
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
        if (isUpdating && _convoId === _conversation._id) {
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
      (message) => message._id === newConvoMessage._id,
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
          const deliveeId = (newConvoMessage.delivered_to as unknown) as string;

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
          const seerId = (newConvoMessage.seen_by as unknown) as string;

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

interface MessagesResponse {
  data: {
    error: boolean;
    messages: Array<APIMessageResponse | Partial<APIMessageResponse>>;
  };
}

export const getConversationMessages = (
  convoId: string,
  status?: 'settled' | 'pending' | 'fulfilled',
  _statusText?: string,
  offset?: number
) => (dispatch: Function) => {
  const getterWrapperFunction = async () => {
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
      conversations: SearchStateV2<APIConversationResponse[]>;
      webSocket: WebSocket;
      chatState: ChatState;
    };
    const { token, id: userId } = userData;
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
      const data = { data: { error: false, messages: [] } } as MessagesResponse;

      if (hasCachedData && (isGettingNew || isUpdating)) {
        data.data.messages = cachedConvoMessages;
        data.data.error = false;

        if (!isUpdating) {
          //ensure to await a few milliseconds so previous states are set before proceeding to avoid bugs
          await delay(100);
        }
      } else {
        const response: AxiosResponse<MessagesResponse> = await axios({
          url: `${baseURL}/conversations/${convoId}/messages?limit=${limit}${`&offset=${
            offset
              ? offset
              : hasCachedData
              ? cachedConvoMessages[0].date
              : Date.now()
          }`}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        data.data.messages = response.data.data.messages ?? [];
        data.data.error = response.data.data.error;
      }

      const error = data.data.error;
      let messages = [...data.data.messages] as APIMessageResponse[];
      const { isOpen, queryString } = chatState;
      const isMinimized = /chat=m2/.test(queryString || '');
      const statusText = _statusText
        ? messages.length
          ? _statusText
          : 'reached end'
        : undefined;
      let hasReachedLastRead = false;

      if (!error) {
        if (socket && socket.readyState === 1) {
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
                    data: [{ _id: convoId, last_read: message.date }]
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
                      message_id: message._id,
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
                          message_id: message._id,
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
      } else {
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
      }

      //hide Snackbar in case it's currently displayed (due to an error event)
      dispatch(displaySnackbar({ timeout: 1000 }));
    } catch (e) {
      logError(conversationMessages)(e);
    }
  };
  getterWrapperFunction();

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
    conversation._id
  ];

  if (!payload.pipe) {
    if (payload.data?.length && payload.data![0]?.conversation_id === convoId) {
      if (/offset|end/.test(payload.statusText as string)) {
        if (
          previousMessages.length &&
          payload.data[0]._id !== previousMessages[0]._id
        ) {
          previousMessages.unshift(...payload.data);
        }
      } else {
        const isOutgoingMessage = !!payload.data[0]?.timestamp_id;

        if (isOutgoingMessage) {
          const newMessage = payload.data[0];
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
          if (payload.data![0]?.date! >= previousMessages.slice(-1)[0]?.date!) {
            previousMessages.push(...payload.data);
          } else {
            previousMessages.unshift(...payload.data);
          }
        }
      }
    }
  } else {
    const messageId = payload.data![0]._id;
    let { value: initialMessage, index: indexOfInitial } = (loopThru(
      previousMessages,
      (message) => message._id === messageId,
      {
        type: 'find',
        includeIndex: true,
        rightToLeft: true,
        makeCopy: true
      }
    ) ?? {}) as LoopFind<APIMessageResponse>;

    if (payload.data?.length === 1) {
      switch (payload.pipe) {
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

export const getConversationInfo = (
  associatedUsername: string,
  conversationId?: string
) => (dispatch: Function): ReduxAction => {
  const type = 'ONE_TO_ONE';
  //should be revisited when classroom conversations API is available
  const url =
    type === 'ONE_TO_ONE' ? `${baseURL}/profile/${associatedUsername}` : '';

  dispatch(conversationInfo({ status: 'pending' }));
  callNetworkStatusCheckerFor({
    name: 'conversationInfo',
    func: conversationInfo
  });

  axios({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getState().userData?.token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(({ data }: any) => {
      const _data = { ...data.data } as UserData & { error: boolean };
      const { error, first_name, last_name, online_status } = _data;

      delete _data.error;
      delete _data.date_of_birth;
      delete _data.email;

      const conversationData: ConversationInfo['data'] = {
        ..._data,
        displayName: `${first_name} ${last_name}`,
        avatar: 'avatar-1.png'
      };

      if (!error) {
        dispatch(
          conversationInfo({
            status: 'fulfilled',
            err: false,
            online_status,
            conversationId,
            data: { ...conversationData }
          })
        );
      } else {
        dispatch(
          conversationInfo({
            status: 'fulfilled',
            err: true,
            online_status,
            conversationId,
            data: {}
          })
        );
      }

      //hide Snackbar in case it's currently displayed (due to an error event)
      dispatch(displaySnackbar({ timeout: 1000 }));
    })
    .catch(logError(conversationInfo));

  return {
    type: GET_CONVERSATION_INFO
  };
};

export const conversationInfo = (payload: ConversationInfo): ReduxAction => {
  return {
    type: SET_CONVERSATION_INFO,
    payload
  };
};

export const chatState = (payload: ChatState): ReduxAction => {
  return {
    type: SET_CHAT_STATE,
    payload
  };
};
