require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const shuttleRoutes = require('./routes/shuttleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const locationRoutes = require('./routes/locationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const userRoutes = require('./routes/userRoutes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import socket handlers
const shuttleSocket = require('./sockets/shuttleSocket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with wildcard CORS for easy multi-device development
const io = socketIo(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true
	}
});

// Expose io instance to Express app request context
app.set('io', io);

// Configure Global Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket event handlers
shuttleSocket(io);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/users', userRoutes);

// Root route for backend health checking
app.get('/', (req, res) => {
	res.json({ message: 'RidePulse backend services active and running' });
});

// Register Fallbacks & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
	try {
		await connectDB();
		server.listen(PORT, () => {
			console.log(`RidePulse Backend server listening on port ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to boot application server:', error);
		process.exit(1);
	}
};

startServer();
