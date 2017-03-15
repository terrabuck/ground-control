const io = require('socket.io-client');

function connectSocket(token, verbose = false) {
  if (!token) {
    throw new Error("No JWT token specified");
  }

  const socket = io('https://api.streamelements.com', {
    path: '/socket'
  });

  socket.on("connect", () => {
    if(verbose) {
      console.log('Socket is connected');
    }
    socket.emit('authenticate:jwt', { token });
  });

  socket.on('authenticated', () => {
    if (verbose) {
      console.log('Socket is authenticated');
    }
  });

  socket.on("authentication:error", reason => {
    console.error('Failed to connect:', reason);
  });

  return socket;
}

module.exports = connectSocket;
