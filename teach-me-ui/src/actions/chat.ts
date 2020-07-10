import axios from 'axios';

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
  SET_CONVERSATION_MESSAGES
} from '../constants/chat';
import { apiBaseURL as baseURL } from '../constants/misc';
import {
  logError,
  getState,
  callNetworkStatusCheckerFor
  // delay
} from '../functions';
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

export const getConversations = () => (dispatch: Function): ReduxAction => {
  dispatch(conversations({ status: 'pending' }));
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

export const conversations = (payload: SearchState): ReduxAction => {
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
      const _data = { ...data };
      const { error, firstname, lastname } = _data;

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
            conversationId,
            data: { ...conversationData }
          })
        );
      } else {
        dispatch(
          conversationInfo({
            status: 'fulfilled',
            err: true,
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

export const getConversationMessages = (convoId: string) => (
  dispatch: Function
): ReduxAction => {
  const token = getState().userData?.token;

  dispatch(conversationMessages({ status: 'pending' }));
  callNetworkStatusCheckerFor({
    name: 'conversationMessages',
    func: conversationMessages
  });

  axios({
    url: `${baseURL}/conversations/${convoId}/messages?limit=20`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(({ data }: any) => {
      const { error } = data;
      const messages: APIMessageResponse[] = data.messages;

      if (!error) {
        dispatch(
          conversationMessages({
            conversationId: convoId,
            status: 'fulfilled',
            err: false,
            data: [...messages.reverse()]
          })
        );
      } else {
        dispatch(
          conversationMessages({
            conversationId: convoId,
            status: 'fulfilled',
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
  let previousMessages = (getState().conversationMessages.data ??
    []) as Partial<APIMessageResponse>[];

  if (
    payload.conversationId &&
    previousMessages[0]?.conversation_id !== payload.conversationId
  ) {
    previousMessages = [];
  }

  if (payload.data!?.length > 0) {
    let newMessage = payload.data![0];
    let indexOfInitial: number = -1;
    let initialMessage =
      previousMessages?.find((message, i) => {
        if (
          message.time_stamp_id &&
          message.time_stamp_id === newMessage.time_stamp_id
        ) {
          indexOfInitial = i;
          return true;
        }
        return false;
      }) ?? null;

    if (initialMessage) {
      delete newMessage.time_stamp_id;
      previousMessages[indexOfInitial] = newMessage;
    } else {
      if (
        payload.data!?.length === 1 &&
        payload.data![0]?.date! > previousMessages.slice(-1)[0]?.date!
      ) {
        previousMessages.push(...payload.data);
      } else {
        previousMessages.unshift(...payload.data);
      }
    }
  }

  return {
    type: SET_CONVERSATION_MESSAGES,
    payload: { ...payload, data: [...previousMessages] }
  };
};

export const conversation = (conversationId: string): ReduxAction => {
  const payload = (getState().conversations.data?.find(
    (conversation: APIConversationResponse) =>
      conversationId === conversation._id
  ) ?? {}) as APIConversationResponse;

  payload.avatar = payload.avatar ? payload.avatar : 'avatar-1.png';

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
