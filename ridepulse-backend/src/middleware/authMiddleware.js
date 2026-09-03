const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
	try {
		const header = req.headers.authorization || '';
		if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });

		const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'ridepulse_default_jwt_secret_key_2026');
		req.user = await User.findById(decoded.id).select('+password');
		if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
		next();
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
};

module.exports = protect;
