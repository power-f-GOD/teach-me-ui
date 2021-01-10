import {
  ReduxAction,
  ChatState,
  APIMessageResponse,
  APIConversationResponse,
  UserData,
  ConversationsMessages,
  LoopFind
} from '../../../constants/interfaces';
import {
  CHAT_MESSAGE_DELIVERED,
  CHAT_READ_RECEIPT,
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR,
  CHAT_NEW_MESSAGE,
  SET_CONVERSATIONS_MESSAGES,
  GET_CONVERSATIONS_MESSAGES
} from '../../../constants/chat';
import {
  logError,
  getState,
  checkNetworkStatusWhilstPend,
  loopThru,
  http
} from '../../../functions';
import { dispatch } from '../../../appStore';
import { conversationMessages } from '.';

export const getConversationsMessages = (
  statusText?: string,
  shouldStoreResponseInState?: boolean
) => (dispatch: Function) => {
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
  const { isOpen, queryParam } = chatState;
  const isMinimized =
    window.innerWidth < 992 && queryParam?.slice(1) === '0' ? true : false;

  dispatch(
    conversationsMessages({
      status: 'pending',
      err: false,
      statusText: statusText ? statusText : 'getting !delivereds on app load.'
    })
  );
  checkNetworkStatusWhilstPend({
    name: 'conversationsMessages',
    func: conversationsMessages
  });

  http
    .get<{ [convoId: string]: APIMessageResponse[] }>(
      '/messages/!delivered',
      true
    )
    .then(({ error, data: mappedConvosMessages }) => {
      if (error) {
        return;
      }

      const _convosMessages = mappedConvosMessages;
      const updatedConvosMessages = { ..._convosMessages };

      for (const key in updatedConvosMessages) {
        const convoMessages = loopThru(
          _convosMessages[key],
          (_message) => {
            const message = _message.seen_by
              ? { ..._message, seen_by: [..._message.seen_by] }
              : ({ ..._message } as APIMessageResponse); // attempt to fix 'object inextensible bug' by copying

            if (!message.delivered_to.includes(userId)) {
              if (socket && socket.readyState === socket.OPEN) {
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
          data: shouldStoreResponseInState
            ? { ...updatedConvosMessages }
            : undefined
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
    const { value, index } = (loopThru(
      [...prevConvoMessages],
      (message) => message.id === newConvoMessage.id,
      { type: 'find', includeIndex: true, rightToLeft: true, makeCopy: true }
    ) ?? {}) as LoopFind<APIMessageResponse>;
    const initialMessage = value
      ? { ...value, seen_by: [...value.seen_by] }
      : (null as APIMessageResponse | null); // attempt to fix 'object inextensible bug' by copying

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
            // console.log('inextensible:', initialMessage, seerId);
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
