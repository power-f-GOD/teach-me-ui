import postRouter from './posts';
import notificationsRouter from './notifications';
// import chatRouter from './chat';

import { getState } from '../functions';

import { SocketPipe } from '../constants';

export default function socketRouter() {
  const socket: WebSocket = getState().webSocket;

  socket.addEventListener('message', (e: any) => {
    const data = JSON.parse(e.data);
    const pipe = data.pipe as SocketPipe;
    if (pipe === undefined) {
      console.error('E014: bad response from socket');
    } else if (pipe.startsWith('POST_')) {
      postRouter(data);
    } else if (pipe.startsWith('PING_')) {
      notificationsRouter(data)
    } else if (pipe.startsWith('CHAT_')) {
      // chatRouter(data)
    }
  });
}
