const updateLocation = async ({ shuttle, latitude, longitude, speed, Location }) => {
	const recordedAt = new Date();
	shuttle.currentLocation = { latitude, longitude, speed: speed || 0, updatedAt: recordedAt };
	await shuttle.save();
	await Location.create({ shuttle: shuttle._id, latitude, longitude, speed: speed || 0, recordedAt });
	return { shuttleId: shuttle._id, latitude, longitude, speed: speed || 0, timestamp: recordedAt.toISOString() };
};

module.exports = { updateLocation };
