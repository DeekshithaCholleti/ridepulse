const Shuttle = require('../models/Shuttle');

const getCrowd = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.shuttleId).select('crowdLevel capacity');
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	res.json({ shuttleId: shuttle._id, crowdLevel: shuttle.crowdLevel, capacity: shuttle.capacity });
};
const updateCrowd = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.shuttleId);
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	if (req.user.role === 'driver' && String(shuttle.driver) !== String(req.user._id)) return res.status(403).json({ message: 'You can only update your assigned shuttle' });
	const { crowdLevel } = req.body;
	if (!['LOW', 'MEDIUM', 'HIGH'].includes(crowdLevel)) return res.status(400).json({ message: 'crowdLevel must be LOW, MEDIUM, or HIGH' });
	shuttle.crowdLevel = crowdLevel;
	await shuttle.save();
	req.app.get('io').emit('shuttle:crowd', { shuttleId: shuttle.id, crowdLevel });
	res.json({ shuttleId: shuttle.id, crowdLevel });
};

module.exports = { getCrowd, updateCrowd };