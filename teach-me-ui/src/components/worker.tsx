import { APIMessageResponse } from '../constants';

const ctx: Worker = self as any;

ctx.addEventListener('message', (message) => {
  const response = message.data as {
    pipe: 'CONVO_MESSAGES';
    data: any;
    extra: any;
  };
  const { pipe } = response;
  const chunkedConvoMessages: any[][] = [[]];
  let chunkIndex = 0;
  let messageIndex = 0;

  switch (pipe) {
    case 'CONVO_MESSAGES':
      const { extra, data: convoMessages } = response as {
        data: APIMessageResponse[];
        extra: {
          userId: string;
          convoLastRead?: number;
          convoUnreadCount: number;
        };
      };
      const { convoUnreadCount, userId, convoLastRead } = extra;

      convoMessages.map((message, key) => {
        const {
          sender_id,
          date,
          delivered_to,
          deleted,
          seen_by,
          id: _id,
          timestamp_id,
          parent: head
        } = message;
        const type =
          sender_id && sender_id !== userId ? 'incoming' : 'outgoing';
        const [prevMessage, nextMessage] = [
          convoMessages![key - 1],
          convoMessages![key + 1]
        ];

        const lastRead = +convoLastRead!;
        const willRenderNewMessageBar =
          date > lastRead &&
          ((prevMessage?.date <= lastRead &&
            !!convoUnreadCount &&
            prevMessage?.date) ||
            (!!convoUnreadCount &&
              key === 0 &&
              convoUnreadCount === convoMessages.length));

        const prevDate = new Date(Number(prevMessage?.date)).toDateString();
        const nextDate = new Date(Number(nextMessage?.date)).toDateString();
        const selfDate = new Date(Number(date)).toDateString();

        const prevAndSelfSentSameDay = prevDate === selfDate;
        const nextAndSelfSentSameDay = nextDate === selfDate;
        const prevDelayed = date! - (prevMessage?.date ?? date!) >= 18e5;
        const nextDelayed = (nextMessage?.date ?? date!) - date! >= 18e5;

        const prevSenderId = (prevMessage ?? {}).sender_id;
        const nextSenderId = (nextMessage ?? {}).sender_id;

        const isFirstOfStack =
          prevSenderId !== sender_id || !prevAndSelfSentSameDay;
        const isOnlyOfStack =
          (prevSenderId !== sender_id && nextSenderId !== sender_id) ||
          (!nextAndSelfSentSameDay && !prevAndSelfSentSameDay);
        const isMiddleOfStack =
          prevSenderId === sender_id &&
          nextSenderId === sender_id &&
          nextAndSelfSentSameDay &&
          prevAndSelfSentSameDay;
        const isLastOfStack =
          nextSenderId !== sender_id || !nextAndSelfSentSameDay || nextDelayed;

        const shouldRenderDate =
          !prevAndSelfSentSameDay && convoUnreadCount !== convoMessages.length;
        const className = `${
          prevDelayed || !prevMessage ? 'delayed mt-3' : ''
        } ${isFirstOfStack ? 'first' : ''} ${isOnlyOfStack ? 'only' : ''} ${
          isLastOfStack ? 'last' : ''
        } ${isMiddleOfStack ? 'middle' : ''}`;

        chunkedConvoMessages[chunkIndex][messageIndex] = {
          message,
          className,
          willRenderNewMessageBar,
          shouldRenderDate
        };

        messageIndex++;

        if (!nextAndSelfSentSameDay) {
          chunkedConvoMessages.push([]);
          chunkIndex++;
          messageIndex = 0;
        }

        if (key === convoMessages.length - 1) {
          if (!chunkedConvoMessages[chunkIndex][0]) {
            chunkedConvoMessages.pop();
          }

          ctx.postMessage({ pipe, data: chunkedConvoMessages, extra });
        }
      });
      break;
  }
});

export default ctx;
