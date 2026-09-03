const jwt = require('jsonwebtoken');

const generateToken = (user) => jwt.sign(
	{ id: user._id.toString(), role: user.role },
	process.env.JWT_SECRET || 'ridepulse_default_jwt_secret_key_2026',
	{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

module.exports = generateToken;
