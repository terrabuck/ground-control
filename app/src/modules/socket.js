const io = require('socket.io-client');

function connectSocket(token, debug = false) {
  if (!token) {
    throw new Error('No JWT token specified');
  }

  const socket = io('https://realtime.streamelements.com', { transports: ['websocket'] });

  socket.on('connect', () => {
    socket.emit('authenticate', { method: 'jwt', token });
    if (debug) console.log('Socket is connected');
  });

  socket.on('authenticated', () => {
    if (debug) console.log('Socket is authenticated');
  });

  socket.on('authentication:error', reason => {
    if (debug) console.error('Failed to connect:', reason);
  });

  return socket;
}

module.exports = connectSocket;
