const User = require('../models/User');
const Shuttle = require('../models/Shuttle');
const Route = require('../models/Route');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, assignedShuttle: user.assignedShuttle });

const register = async (req, res) => {
	const { name, email, password, role } = req.body;
	if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
	
	if (role && !['student', 'driver'].includes(role)) {
		return res.status(400).json({ message: 'Invalid role selection' });
	}
	const finalRole = role || 'student';
	
	if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered' });

	let assignedShuttle = null;
	if (finalRole === 'driver') {
		// Find a shuttle that does not have a driver assigned
		let shuttle = await Shuttle.findOne({ driver: null });
		if (!shuttle) {
			// Create a default shuttle if none is free
			const route = await Route.findOne();
			shuttle = await Shuttle.create({
				shuttleNumber: `RP-${Math.floor(100 + Math.random() * 900)}`,
				route: route ? route._id : null,
				capacity: 40,
				status: 'active'
			});
		}
		assignedShuttle = shuttle._id;
	}

	const user = await User.create({ name, email, password, role: finalRole, assignedShuttle });

	if (finalRole === 'driver' && assignedShuttle) {
		await Shuttle.findByIdAndUpdate(assignedShuttle, { driver: user._id });
	}

	res.status(201).json({ user: publicUser(user), token: generateToken(user) });
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
	res.json({ user: publicUser(user), token: generateToken(user) });
};

const profile = (req, res) => res.json({ user: publicUser(req.user) });

module.exports = { register, login, profile };
