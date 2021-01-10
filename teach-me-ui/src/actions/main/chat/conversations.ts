import produce from 'immer';

import {
  ReduxAction,
  ConversationMessages,
  APIMessageResponse,
  APIConversationResponse,
  UserData,
  ConversationsMessages,
  LoopFind,
  FetchState
} from '../../../constants/interfaces';
import {
  GET_CONVERSATIONS,
  SET_CONVERSATIONS,
  SET_CONVERSATION,
  CHAT_MESSAGE_DELIVERED,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_NEW_MESSAGE,
  CHAT_TYPING
} from '../../../constants/chat';
import { ONLINE_STATUS } from '../../../constants/misc';
import {
  logError,
  getState,
  checkNetworkStatusWhilstPend,
  loopThru,
  http
} from '../../../functions';
import { dispatch } from '../../../appStore';
import { displaySnackbar } from '../../misc';
import { conversationsMessages } from '.';

export const getConversations = (
  status?: 'pending' | 'settled' | 'fulfilled'
) => (dispatch: Function) => {
  dispatch(conversations({ status: status ? status : 'pending', err: false }));
  checkNetworkStatusWhilstPend({
    name: 'conversations',
    func: conversations
  });

  http
    .get<APIConversationResponse[]>('/conversations?limit=20&offset=', true)
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
          ({ colleague }) => user_id === colleague?.id,
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

            // console.log('actualConvo:', actualConvo);
            //update current conversation
            // setTimeout(() =)
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
        // console.trace(data);
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
