const Shuttle = require('../models/Shuttle');

const listShuttles = async (req, res) => res.json(await Shuttle.find().populate('route driver', 'routeName name email'));
const getShuttle = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.id).populate('route driver', 'routeName name email');
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	res.json(shuttle);
};
const createShuttle = async (req, res) => res.status(201).json(await Shuttle.create(req.body));
const updateShuttle = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.id);
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });

	if (req.user.role === 'driver' && String(shuttle.driver) !== String(req.user._id)) {
		return res.status(403).json({ message: 'You can only update your assigned shuttle' });
	}

	if (req.user.role === 'driver') {
		const allowedFields = ['status', 'crowdLevel'];
		const keys = Object.keys(req.body);
		const containsDisallowed = keys.some(key => !allowedFields.includes(key));
		if (containsDisallowed) {
			return res.status(403).json({ message: 'Drivers can only update status and crowd level' });
		}
	}

	Object.assign(shuttle, req.body);
	const updated = await shuttle.save();
	
	// Emit live status/crowd updates to socket room
	try {
		req.app.get('io').to(`shuttle:${shuttle.id}`).emit('shuttle:update', updated);
	} catch (socketErr) {
		console.error('Socket broadcast error on shuttle update:', socketErr);
	}

	res.json(updated);
};
const deleteShuttle = async (req, res) => {
	if (!await Shuttle.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Shuttle not found' });
	res.status(204).send();
};

module.exports = { listShuttles, getShuttle, createShuttle, updateShuttle, deleteShuttle };
