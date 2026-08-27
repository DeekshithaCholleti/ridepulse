const User = require('../models/User');

const listUsers = async (req, res) => {
	try {
		const users = await User.find().populate('assignedShuttle', 'shuttleNumber');
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const listDrivers = async (req, res) => {
	try {
		const drivers = await User.find({ role: 'driver' }).populate('assignedShuttle', 'shuttleNumber');
		res.json(drivers);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createDriver = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: 'Email is already registered' });
		}
		const user = await User.create({ name, email, password, role: 'driver' });
		res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = { listUsers, listDrivers, createDriver, deleteUser };
