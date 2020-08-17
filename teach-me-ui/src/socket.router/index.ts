import post from './posts';
import notifications from './notifications';
import chat from './chat';
import misc from './misc';

import { getState } from '../functions';
import { SocketPipe } from '../constants';

export default function activateSocketRouters() {
  const socket: WebSocket = getState().webSocket;

  socket.addEventListener('message', (e: any) => {
    const message = JSON.parse(e.data);
    const pipe = message.pipe as SocketPipe;

    switch (true) {
      case pipe.startsWith('POST_'):
        post(message);
        break;
      case pipe.startsWith('PING_'):
        notifications(message);
        break;
      case pipe.startsWith('CHAT_'):
        if (!message.error)
          chat(message);
        break;
      case pipe === undefined:
        console.error('E014: bad response from socket');
        break;
      default:
        misc(message);
    }
  });
}
