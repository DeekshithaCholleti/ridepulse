// Real-time shuttle Socket.IO handlers
module.exports = (io) => {
	io.on('connection', (socket) => {
		console.log('Socket client connected:', socket.id);

		// Handle joining a shuttle's real-time updates room
		socket.on('join-shuttle', (shuttleId) => {
			socket.join(`shuttle:${shuttleId}`);
			console.log(`Socket ${socket.id} joined room: shuttle:${shuttleId}`);
		});

		// Handle leaving a shuttle's room
		socket.on('leave-shuttle', (shuttleId) => {
			socket.leave(`shuttle:${shuttleId}`);
			console.log(`Socket ${socket.id} left room: shuttle:${shuttleId}`);
		});

		socket.on('disconnect', () => {
			console.log('Socket client disconnected:', socket.id);
		});
	});
};
