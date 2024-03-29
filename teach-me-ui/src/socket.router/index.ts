import post from './posts';
import notifications from './notifications';
import chat from './chat';
import misc from './misc';

import { getState } from '../functions';
import { SocketPipe } from '../types';

export default function activateSocketRouters() {
  const socket: WebSocket = getState().webSocket;

  socket.addEventListener('message', (e: any) => {
    if (e.data === 'error') {
      console.error('E014: bad response from socket');
      return;
    }

    const message = JSON.parse(e.data);

    if (message.error) {
      console.error('E014: ' + message.message);
    }

    const pipe = message.pipe as SocketPipe;

    switch (true) {
      case pipe.startsWith('POST_'):
        // console.log('Post pipe response:', message);
        if (!message.error) post(message);
        break;
      case pipe.startsWith('PING_'):
        notifications(message);
        break;
      case pipe.startsWith('CHAT_'):
        if (!message.error) chat(message);
        break;
      case pipe === undefined:
        console.error('E014: bad response from socket. Pipe undefined!');
        break;
      default:
        misc(message);
    }
  });
}
