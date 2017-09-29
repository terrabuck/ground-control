const io = require('socket.io-client');

function connectSocket(token) {
	if (!token) {
		throw new Error("No JWT token specified");
	}

	const socket = io("https://realtime.streamelements.com", { transports: ['websocket'] });

	socket.on("connect", () => {
		console.log('Socket is connected');
		socket.emit('authenticate:jwt', { token });
	});

	socket.on('authenticated', () => {
		console.log('Socket is authenticated');
	});

	socket.on("authentication:error", reason => {
		console.error('Failed to connect:', reason);
	});

	return socket;
}

module.exports = connectSocket;
