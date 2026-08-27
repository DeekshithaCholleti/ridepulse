const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, assignedShuttle: user.assignedShuttle });

const register = async (req, res) => {
	const { name, email, password, role } = req.body;
	if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
	if (role && role !== 'student') return res.status(403).json({ message: 'Public registration is for students only' });
	if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered' });

	const user = await User.create({ name, email, password, role: 'student' });
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
