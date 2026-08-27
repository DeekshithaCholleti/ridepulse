const Shuttle = require('../models/Shuttle');
const Location = require('../models/Location');
const { updateLocation } = require('../services/gpsService');

const updateGpsLocation = async (req, res) => {
	const { shuttleId, latitude, longitude, speed } = req.body;
	if (!shuttleId || latitude === undefined || longitude === undefined) return res.status(400).json({ message: 'shuttleId, latitude, and longitude are required' });
	const shuttle = await Shuttle.findById(shuttleId);
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	if (req.user.role === 'driver' && String(shuttle.driver) !== String(req.user._id)) return res.status(403).json({ message: 'You can only update your assigned shuttle' });

	const location = await updateLocation({ shuttle, latitude, longitude, speed, Location });
	req.app.get('io').to(`shuttle:${shuttle.id}`).emit('shuttle:location', location);
	res.json(location);
};

const getLatestLocation = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.shuttleId).select('currentLocation status');
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	res.json({ shuttleId: shuttle._id, status: shuttle.status, location: shuttle.currentLocation || null });
};

const getLocationHistory = async (req, res) => res.json(await Location.find({ shuttle: req.params.shuttleId }).sort({ recordedAt: -1 }).limit(100));

module.exports = { updateGpsLocation, getLatestLocation, getLocationHistory };
