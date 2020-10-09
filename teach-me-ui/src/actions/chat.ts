import axios, { AxiosResponse } from 'axios';
import produce from 'immer';
import queryString from 'query-string';

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
  LoopFind
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
  loop
} from '../functions';
import { dispatch } from '../appStore';
import { displaySnackbar } from './misc';

export const getConversations = (
  status?: 'pending' | 'settled' | 'fulfilled'
) => (dispatch: Function) => {
  dispatch(conversations({ status: status ? status : 'pending' }));
  callNetworkStatusCheckerFor({
    name: 'conversations',
    func: conversations
  });

  axios({
    url: `${baseURL}/conversations?limit=20&offset=`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getState().userData?.token}`,
      'Content-Type': 'application/json'
    }
  })
    .then((response: any) => {
      const { error, conversations: _conversations } = response.data;

      if (!error) {
        dispatch(
          conversations({
            status: 'fulfilled',
            err: false,
            data: [..._conversations]
          })
        );
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
        } = loop(
          initialConversations,
          (conversation) => user_id === conversation?.associated_user_id,
          { type: 'find', includeIndex: true }
        ) as LoopFind<APIConversationResponse>;

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
        } = loop(
          initialConversations,
          (conversation) => message?.conversation_id === conversation._id,
          { type: 'find', includeIndex: true }
        ) as LoopFind<APIConversationResponse>;

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
      } = loop(
        initialConversations,
        (conversation) => user_id === conversation.associated_user_id,
        { type: 'find', includeIndex: true }
      ) as LoopFind<APIConversationResponse>;

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
      } = loop(
        initialConversations,
        (conversation) => convoId === conversation._id,
        { type: 'find', includeIndex: true }
      ) as LoopFind<APIConversationResponse>;

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
  conversationId: string,
  data?: Partial<APIConversationResponse>,
  shouldUpdateAll?: boolean
): ReduxAction => {
  const { conversations, conversation } = getState() as {
    conversations: SearchState;
    conversation: APIConversationResponse;
  };
  const dataFromConvos =
    conversations.data?.find(
      (conversation: APIConversationResponse) =>
        conversationId === conversation?._id
    ) ?? {};
  const dataFromConvo = conversation;
  let payload: APIConversationResponse;

  if (!data) {
    payload = { ...dataFromConvos };
  } else {
    if (shouldUpdateAll) {
      payload = { ...dataFromConvos, ...data };
    } else {
      if (conversationId === dataFromConvo._id) {
        payload = { ...dataFromConvos, ...dataFromConvo, ...data };
      } else {
        payload = { ...dataFromConvos, ...data };
      }
    }
  }

  payload.avatar = payload.avatar ? payload.avatar : 'avatar-1.png';

  //make payload an empty object in order for hack to work in corresponding reducer
  if (!payload._id) {
    delete payload.avatar;
  }

  return {
    type: SET_CONVERSATION,
    payload
  };
};

export const getConversationsMessages = (
  convoId?: string,
  statusText?: string
) => (dispatch: Function) => {
  const token = getState().userData?.token;

  // const limit = 20;

  dispatch(
    conversationsMessages({
      status: 'pending',
      statusText: statusText
        ? statusText
        : "Don't remove this prop to avoid the scroll to bottom bug."
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
    .then(
      (
        response: AxiosResponse<{
          error: boolean;
          conversations: { [convoId: string]: APIMessageResponse[] };
        }>
      ) => {
        const { data } = response;

        if (!data.error) {
          // console.log('not delivereds', data);

          dispatch(
            conversationsMessages({
              status: 'fulfilled',
              err: false,
              data: { ...data.conversations }
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
      }
    )
    .catch(logError(conversationsMessages));

  return {
    type: GET_CONVERSATIONS_MESSAGES
  };
};

export const conversationsMessages = (
  _payload: ConversationsMessages
): ReduxAction => {
  const _conversationsMessages = getState()
    .conversationsMessages as ConversationsMessages;
  const { statusText, data: _data } = _payload;
  const convoId = Object.keys((_data as any) ?? {})[0];
  const { data } = _conversationsMessages;
  const previousMessages =
    convoId && data && data![convoId] ? [...data![convoId]] : [];
  const shouldReplace = /replace/.test(statusText ?? '');
  // const newConvoMessages = _payload.data[convoId];
  // const newMessages = newConvoMessages ?? [];
  // console.log('previousMessages:', previousConvoMessages)
  //update previousMessages with newMessages;

  const payload: ConversationsMessages =
    convoId && _data
      ? {
          ..._payload,
          data: {
            ...data,
            ..._payload.data,
            [convoId as string]:
              shouldReplace && _data
                ? [..._data[convoId as string]]
                : [...previousMessages, ...(_data[convoId] ?? [])]
          }
          // [convoId]: [...previousMessages]
        }
      : !_data
      ? { ..._payload, ...data }
      : { ..._payload };

  // console.log(_payload, payload);
  return {
    type: SET_CONVERSATIONS_MESSAGES,
    payload
  };
};

interface MessagesAxiosResponse {
  error: boolean;
  messages: Array<APIMessageResponse | Partial<APIMessageResponse>>;
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
      webSocket: socket
    } = getState() as {
      userData: UserData;
      conversationsMessages: ConversationsMessages;
      conversation: APIConversationResponse;
      webSocket: WebSocket;
    };
    const token = userData?.token;
    const userId = userData.id;
    const { last_read, last_message } = _conversation;
    const cachedConvoMessages = _conversationsMessages.data![convoId] ?? [];
    const isGettingNew = /new/.test(_statusText ?? '');
    const limit = 20;
    const hasCachedData =
      cachedConvoMessages.length &&
      (cachedConvoMessages.length >= limit ||
        cachedConvoMessages.slice(-1)[0]._id === last_message._id);

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
      const data = { error: false, messages: [] } as MessagesAxiosResponse;

      if (hasCachedData && isGettingNew) {
        data.messages = cachedConvoMessages;
        data.error = false;

        if (_conversation.unread_count) {
          const response: AxiosResponse<MessagesAxiosResponse> = await axios({
            url: `${baseURL}/conversations/${convoId}/messages?limit=${_conversation.unread_count}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.data.error) {
            data.messages.push(...response.data.messages.reverse());
          }
        } else {
          //ensure to await a few milliseconds so previous states are set before proceeding
          await delay(200);
        }

        // console.log('mess:', data);
      } else {
        const response: AxiosResponse<MessagesAxiosResponse> = await axios({
          url: `${baseURL}/conversations/${convoId}/messages?limit=${limit}${
            offset ? `&offset=${offset}` : ''
          }`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        data.messages = response.data.messages;
        data.error = response.data.error;
      }

      const error = data.error;
      let messages = data.messages as APIMessageResponse[];
      const chat = queryString.parse(window.location.search).chat;
      const [isOpen, isMinimized] = [!!chat, chat === 'm2'];
      const statusText = _statusText
        ? messages.length
          ? _statusText
          : 'reached end'
        : undefined;
      let hasReachedLastRead = false;

      if (!error) {
        if (socket && socket.readyState === 1) {
          messages = loop(
            messages,
            (message) => {
              if (hasReachedLastRead && message.sender_id === userId) {
                dispatch(conversation(convoId, { last_read: message.date }));
                dispatch(
                  conversations({
                    data: [{ _id: convoId, last_read: message.date }]
                  })
                );
              }

              if (message.date === last_read) {
                hasReachedLastRead = true;
              }

              if (message.sender_id !== userId) {
                if (!message.delivered_to!.includes(userId)) {
                  socket.send(
                    JSON.stringify({
                      message_id: message._id,
                      pipe: CHAT_MESSAGE_DELIVERED
                    })
                  );
                  message.delivered_to.push(userId);
                }

                if (!message.seen_by!.includes(userId)) {
                  if (convoId === message.conversation_id) {
                    if (isOpen && !isMinimized) {
                      socket.send(
                        JSON.stringify({
                          message_id: message._id,
                          pipe: CHAT_READ_RECEIPT
                        })
                      );
                      //update last_read state var (to avoid bugs)
                      dispatch(
                        conversations({
                          data: [{ _id: convoId, last_read: message.date }]
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
            convoId: convoId,
            status: 'fulfilled',
            err: false,
            statusText,
            data: [...messages]
          })
        );

        if (isGettingNew) {
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
  let [previousMessages, convoId, cid] = [
    conversationMessages.data as Partial<APIMessageResponse>[],
    conversation._id,
    queryString.parse(window.location.search).cid
  ];

  if (!payload.pipe) {
    if (
      payload.data?.length &&
      payload.data![0]?.conversation_id === (convoId || cid)
    ) {
      if (payload.data?.length === 1) {
        let newMessage = payload.data[0];
        let {
          value: initialMessage,
          index: indexOfInitial
        } = loop(
          previousMessages,
          (message) =>
            message.timestamp_id &&
            message.timestamp_id === newMessage.timestamp_id,
          { type: 'find', includeIndex: true, rightToLeft: true }
        ) as { value: APIMessageResponse; index: number };

        if (initialMessage) {
          delete newMessage.timestamp_id;
          previousMessages[indexOfInitial] = newMessage;
        } else {
          if (
            payload.data!?.length === 1 &&
            payload.data![0]?.date! >= previousMessages.slice(-1)[0]?.date!
          ) {
            previousMessages.push(...payload.data);
          } else {
            previousMessages.unshift(...payload.data);
          }
        }
      } else if (/offset|end/.test(payload.statusText as string)) {
        if (
          payload.data &&
          previousMessages.length &&
          payload.data[0]._id !== previousMessages[0]._id
        ) {
          previousMessages.unshift(...payload.data);
        }
      } else {
        previousMessages = [...payload.data];
      }
    }
  } else {
    const messageId = payload.data![0]._id;
    let { value: initialMessage, index: indexOfInitial } = loop(
      previousMessages,
      (message) => message._id === messageId,
      {
        type: 'find',
        includeIndex: true,
        rightToLeft: true
      }
    ) as { value: APIMessageResponse; index: number };

    if (payload.data?.length === 1) {
      switch (payload.pipe) {
        case CHAT_MESSAGE_DELIVERED:
          const deliveeId = payload.data![0].delivered_to![0];

          if (
            initialMessage &&
            !initialMessage.delivered_to!.includes(deliveeId) &&
            deliveeId
          ) {
            initialMessage.delivered_to?.push(deliveeId);
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_READ_RECEIPT:
          const seerId = payload.data![0].seen_by![0];

          if (
            initialMessage &&
            !initialMessage.seen_by!.includes(seerId) &&
            seerId
          ) {
            initialMessage.seen_by?.push(seerId);
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

  // console.trace(convoId, 'payload:', { ...resultingPayload }, previousMessages);

  return {
    type: SET_CONVERSATION_MESSAGES,
    payload: resultingPayload
  };
};

export const getConversationInfo = (
  associatedUsername: string,
  conversationId?: string
) => (dispatch: Function): ReduxAction => {
  const type = 'ONE_TO_ONE'; //type ? type : 'ONE_TO_ONE';

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
      const _data = { ...data } as UserData & { error: boolean };
      const { error, firstname, lastname, online_status } = _data;

      delete _data.error;
      delete _data.date_of_birth;
      delete _data.email;

      const conversationData: ConversationInfo['data'] = {
        ..._data,
        displayName: `${firstname} ${lastname}`,
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
