const getCrowdLevel = (passengers, capacity) => {
	const percentage = (passengers / capacity) * 100;
	if (percentage <= 40) return 'LOW';
	if (percentage <= 75) return 'MEDIUM';
	return 'HIGH';
};

module.exports = { getCrowdLevel };
