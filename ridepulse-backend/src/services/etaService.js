const calculateDistance = require('../utils/calculateDistance');

const calculateEtaMinutes = (location, stop, speedKmh = 25) => {
	if (!location || !stop || speedKmh <= 0) return null;
	return Math.max(0, Math.ceil((calculateDistance(location, stop) / speedKmh) * 60));
};

module.exports = { calculateEtaMinutes };
