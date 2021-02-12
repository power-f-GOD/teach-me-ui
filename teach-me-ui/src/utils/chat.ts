import { APIConversationResponse, ConversationMessages } from '../types';
import {
  getConversationMessages,
  conversation,
  conversationMessages,
  conversationsMessages,
  conversations
} from '../actions';
import { dispatch, delay, getState } from '../utils';

export const getNecessaryConversationData = (arg: {
  extra: { convoId: string; userId: string };
  e?: Event;
  history: any;
}) => {
  const { extra, e, history } = arg;
  const { convoId } = extra;
  const {
    conversation: _conversation,
    conversationMessages: _conversationMessages
  } = getState() as {
    //using getState here to prevent rerenders that would be caused if props is used
    conversation: APIConversationResponse;
    conversationMessages: ConversationMessages;
  };
  const { id: prevChatConvoId } = _conversation;
  const prevChatConvoMessages = _conversationMessages.data;

  if (prevChatConvoId === convoId) {
    history.replace(`${window.location.pathname}?1`);
    e?.preventDefault();
    return;
  }

  //update store for previous chat before updating/populating current chat
  if (prevChatConvoId && prevChatConvoMessages?.length) {
    dispatch(
      conversationsMessages({
        convoId: prevChatConvoId,
        statusText: 'replace messages',
        data: { [prevChatConvoId]: [...prevChatConvoMessages] }
      })
    );
  }

  dispatch(
    getConversationMessages(convoId, 'pending', 'loading new')(dispatch)
  );

  if (window.navigator.onLine) {
    // dispatch(getConversationInfo(userId)(dispatch));

    //delay so that state conversation unread_count is not updated immediately when the conversation opens
    delay(1250).then(() => {
      dispatch(conversations({ data: [{ unread_count: 0, id: convoId }] }));
    });
  } else {
    dispatch(conversationMessages({ status: 'pending', err: true }));
  }

  // dispatch(chatState(chatInfo));
  dispatch(conversation(convoId));
};
