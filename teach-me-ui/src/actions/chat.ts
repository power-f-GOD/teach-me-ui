import axios from 'axios';
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
  UserData
} from '../constants/interfaces';
import {
  GET_PEOPLE_ENROLLED_IN_INSTITUTION,
  SET_PEOPLE_ENROLLED_IN_INSTITUTION,
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
  CHAT_TYPING
} from '../constants/chat';
import { apiBaseURL as baseURL, ONLINE_STATUS } from '../constants/misc';
import { logError, getState, callNetworkStatusCheckerFor } from '../functions';
import { dispatch } from '../appStore';

// import { displaySnackbar } from './misc';

export const getUsersEnrolledInInstitution = (params?: string) => (
  dispatch: Function
): ReduxAction => {
  dispatch(usersEnrolledInInstitution({ status: 'pending' }));
  callNetworkStatusCheckerFor({
    name: 'usersEnrolledInInstitution',
    func: usersEnrolledInInstitution
  });

  axios({
    url: `${baseURL}/people/find?limit=10`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${(getState().userData as UserData)?.token}`
    }
  })
    .then((response: any) => {
      if (!response.data.error) {
        dispatch(
          usersEnrolledInInstitution({
            status: 'fulfilled',
            err: false,
            data: response.data.people
          })
        );
      } else {
        dispatch(
          usersEnrolledInInstitution({
            status: 'fulfilled',
            err: true,
            data: []
          })
        );
      }
    })
    .catch(logError(usersEnrolledInInstitution));

  return {
    type: GET_PEOPLE_ENROLLED_IN_INSTITUTION
  };
};

export const usersEnrolledInInstitution = (
  payload: SearchState
): ReduxAction => {
  return {
    type: SET_PEOPLE_ENROLLED_IN_INSTITUTION,
    payload
  };
};

export const getConversations = (
  status?: 'pending' | 'settled' | 'fulfilled'
) => (dispatch: Function): ReduxAction => {
  dispatch(conversations({ status: status ? status : 'pending' }));
  callNetworkStatusCheckerFor({
    name: 'conversations',
    func: conversations
  });

  axios({
    url: `${baseURL}/conversations?limit=10&offset=`,
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
    _id: convoId
  } = (payload.data ?? [])[0] ?? {};
  const message = (payload.data ?? [])[0] ?? ({} as APIMessageResponse);
  const [
    initialConversations,
    _conversationInfo,
    conversationMessages,
    userData
  ] = [
    (getState().conversations.data ?? []) as Partial<APIConversationResponse>[],
    getState().conversationInfo as ConversationInfo,
    getState().conversationMessages.data as ConversationMessages['data'],
    getState().userData as UserData
  ];
  let indexOfInitial = -1;
  let actualConvo = {} as
    | Partial<
        APIConversationResponse & {
          last_message: APIMessageResponse & { is_recent?: boolean };
        }
      >
    | undefined;

  if (pipe && initialConversations.length) {
    switch (pipe) {
      case ONLINE_STATUS:
        actualConvo = initialConversations?.find((conversation, i) => {
          if (user_id === conversation?.associated_user_id) {
            indexOfInitial = i;
            return true;
          }
          return false;
        });

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
      case CHAT_TYPING:
      case CHAT_NEW_MESSAGE:
      case CHAT_READ_RECEIPT:
      case CHAT_MESSAGE_DELETED:
      case CHAT_MESSAGE_DELETED_FOR:
      case CHAT_MESSAGE_DELIVERED:
        actualConvo = initialConversations?.find((conversation, i) => {
          if (message?.conversation_id === conversation._id) {
            indexOfInitial = i;
            return true;
          }
          return false;
        });

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
            const [id, convoId] = [
              queryString.parse(window.location.search)?.id,
              _conversationInfo.data?.id
            ];

            if (
              actualConvo.last_message?._id === message._id &&
              pipe === CHAT_MESSAGE_DELETED_FOR
            ) {
              if (convoId === id && convoId) {
                const last_message = conversationMessages?.slice(-2)[0];
                actualConvo.last_message = last_message as any;
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
  } else if (_payload.data?.length) {
    if (pipe) {
      actualConvo = initialConversations?.find((conversation, i) => {
        if (user_id === conversation.associated_user_id) {
          indexOfInitial = i;
          return true;
        }
        return false;
      });

      if (actualConvo && payload.data?.length === 1) {
        actualConvo = { ...actualConvo, ...message };
        initialConversations[indexOfInitial] = actualConvo as Partial<
          APIConversationResponse
        >;
        payload.data = initialConversations;
      } else {
        payload.data = [...initialConversations];
      }
    } else if (!initialConversations.length) {
      payload.data = [..._payload.data];
    } else if (unread_count !== undefined && !payload?.status) {
      actualConvo = initialConversations?.find((conversation, i) => {
        if (convoId === conversation._id) {
          indexOfInitial = i;
          return true;
        }
        return false;
      });
      
      if (actualConvo) {
        actualConvo.unread_count = unread_count;
        initialConversations[indexOfInitial] = actualConvo as Partial<
          APIConversationResponse
        >;
        payload.data = initialConversations;
      }
    }
  }

  return {
    type: SET_CONVERSATIONS,
    payload
  };
};

// export const conversationsMessages = (
//   _payload: ConversationsMessages
// ): ReduxAction => {
//   const convoId = Object.keys(_payload).find((key) =>
//     /\d\w?/.test(key)
//   ) as string;
//   const previousConvoMessages = getState().conversationsMessages[convoId];
//   const previousMessages = previousConvoMessages
//     ? [...previousConvoMessages]
//     : [];
//   const newConvoMessages = _payload[convoId];
//   const newMessages = newConvoMessages ?? [];
//   // console.log('previousMessages:', previousConvoMessages)
//   //update previousMessages with newMessages;
//   for (const i in newMessages) {
//     let hasTimestamp = newMessages[i].time_stamp_id;

//     if (hasTimestamp) {
//       for (const j in previousMessages) {
//         let found = previousMessages[j].time_stamp_id;

//         if (hasTimestamp === found) {
//           delete newMessages[i].time_stamp_id;
//           previousMessages[j] = newMessages[i];
//           break;
//         } else if (+j === previousMessages.length - 1) {
//           previousMessages.unshift(newMessages[i]);
//         }
//       }
//     } else {
//       previousMessages.push(newMessages[i]);
//     }
//   }

//   const payload: ConversationsMessages = {
//     ..._payload,
//     [convoId]: [...previousMessages]
//   };

//   return {
//     type: SET_CONVERSATION_MESSAGES,
//     payload
//   };
// };

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

export const getConversationMessages = (
  convoId: string,
  status?: 'settled' | 'pending' | 'fulfilled',
  statusText?: string,
  offset?: number
) => (dispatch: Function): ReduxAction => {
  const token = getState().userData?.token;
  const limit = 20;

  dispatch(
    conversationMessages({
      status: status ? status : 'pending',
      statusText: statusText
        ? statusText
        : "Don't remove this prop to avoid the scroll to bottom bug."
    })
  );
  callNetworkStatusCheckerFor({
    name: 'conversationMessages',
    func: conversationMessages
  });

  axios({
    url: `${baseURL}/conversations/${convoId}/messages?limit=${limit}${
      offset ? `&offset=${offset}` : ''
    }`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(({ data }: any) => {
      const { error } = data;
      const messages: APIMessageResponse[] = data.messages;
      const userId = (getState().userData as UserData)!.id;
      const socket = getState().webSocket as WebSocket;
      const convoId =
        (getState().conversation as APIConversationResponse)._id ??
        queryString.parse(window.location.search).cid ??
        '';
      const chatState = getState().chatState as ChatState;

      if (!error) {
        if (socket && socket.readyState === 1) {
          for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i];

            if (message.sender_id !== userId) {
              if (!message.delivered_to!.includes(userId)) {
                socket.send(
                  JSON.stringify({
                    message_id: message._id,
                    pipe: CHAT_MESSAGE_DELIVERED
                  })
                );
              }

              if (!message.seen_by!.includes(userId)) {
                if (convoId === message.conversation_id) {
                  if (chatState.isOpen && !chatState.isMinimized) {
                    socket.send(
                      JSON.stringify({
                        message_id: message._id,
                        pipe: CHAT_READ_RECEIPT
                      })
                    );
                  }
                }
              }
            }
          }
        }

        dispatch(
          conversationMessages({
            conversationId: convoId,
            status: 'fulfilled',
            err: false,
            statusText: statusText
              ? messages.length
                ? statusText
                : 'reached end'
              : undefined,
            data: [...messages.reverse()]
          })
        );
      } else {
        dispatch(
          conversationMessages({
            conversationId: convoId,
            status: 'fulfilled',
            statusText: statusText ? statusText : undefined,
            err: true,
            data: []
          })
        );
      }
    })
    .catch(logError(conversationMessages));

  return {
    type: GET_CONVERSATION_MESSAGES
  };
};

export const conversationMessages = (payload: ConversationMessages) => {
  let [previousMessages, convoId] = [
    (getState().conversationMessages.data ?? []) as Partial<
      APIMessageResponse
    >[],
    (getState().conversation as Partial<APIConversationResponse>)._id
  ];

  if (!payload.pipe) {
    if (payload.data?.length && payload.data![0]?.conversation_id === convoId) {
      if (payload.data?.length === 1) {
        let newMessage = payload.data[0];
        let indexOfInitial: number = -1;
        let initialMessage =
          previousMessages?.find((message, i) => {
            if (
              message.timestamp_id &&
              message.timestamp_id === newMessage.timestamp_id
            ) {
              indexOfInitial = i;
              return true;
            }
            return false;
          }) ?? null;

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
    const msg_id = payload.data![0]._id;
    let indexOfInitial = -1;
    let initialMessage =
      previousMessages?.find((message, i) => {
        if (message._id === msg_id) {
          indexOfInitial = i;
          return true;
        }
        return false;
      }) ?? null;

    if (payload.data?.length === 1) {
      switch (payload.pipe) {
        case CHAT_MESSAGE_DELIVERED:
          const deliveeId = payload.data![0].delivered_to![0];

          if (
            initialMessage &&
            !initialMessage.delivered_to!.includes(deliveeId)
          ) {
            initialMessage.delivered_to?.push(deliveeId);
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_READ_RECEIPT:
          const seerId = payload.data![0].seen_by![0];

          if (initialMessage && !initialMessage.seen_by!.includes(seerId)) {
            initialMessage.seen_by?.push(seerId);
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_MESSAGE_DELETED:
          if (initialMessage && !initialMessage.deleted) {
            initialMessage.deleted = true;
            previousMessages[indexOfInitial] = initialMessage;
          }
          break;
        case CHAT_MESSAGE_DELETED_FOR:
          if (initialMessage) {
            initialMessage.deleted = true;
            previousMessages.splice(indexOfInitial, 1);
          }
          break;
      }
    }
  }

  return {
    type: SET_CONVERSATION_MESSAGES,
    payload: {
      ...payload,
      data: [
        ...(payload.data?.length || (payload.status !== 'pending' && convoId)
          ? previousMessages
          : [])
      ]
    }
  };
};

export const conversation = (conversationId: string): ReduxAction => {
  const payload = (getState().conversations.data?.find(
    (conversation: APIConversationResponse) =>
      conversationId === conversation?._id
  ) ?? {}) as APIConversationResponse;

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

export const chatState = (payload: ChatState): ReduxAction => {
  return {
    type: SET_CHAT_STATE,
    payload
  };
};
