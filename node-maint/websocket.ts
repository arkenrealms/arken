import { io, ManagerOptions, SocketOptions, type Socket } from 'socket.io-client';
import { log } from './log';

export function emitAll(io, ...args) {
  log('Emit All', ...args);

  io.emit(...args);
}

export function emitDirect(socket, ...args) {
  log('Emit Direct', ...args);

  if (!socket || !socket.emit) return;

  socket.emit(...args);
}

interface CustomSocketOptions extends Partial<ManagerOptions & SocketOptions> {
  transports?: string[];
}

export function getClientSocket(endpoint: string): Socket {
  log('Connecting to', endpoint);
  return io(endpoint, {
    transports: ['websocket'],
    upgrade: false,
    autoConnect: false,
    // pingInterval: 5000,
    // pingTimeout: 20000
    // extraHeaders: {
    //   "my-custom-header": "1234"
    // }
  } as CustomSocketOptions);
}
