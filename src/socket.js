import { io } from 'socket.io-client';

const BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export const socket = io(BASE, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
