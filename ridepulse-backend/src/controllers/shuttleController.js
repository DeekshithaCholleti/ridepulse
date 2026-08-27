const Shuttle = require('../models/Shuttle');

const listShuttles = async (req, res) => res.json(await Shuttle.find().populate('route driver', 'routeName name email'));
const getShuttle = async (req, res) => {
	const shuttle = await Shuttle.findById(req.params.id).populate('route driver', 'routeName name email');
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	res.json(shuttle);
};
const createShuttle = async (req, res) => res.status(201).json(await Shuttle.create(req.body));
const updateShuttle = async (req, res) => {
	const shuttle = await Shuttle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
	if (!shuttle) return res.status(404).json({ message: 'Shuttle not found' });
	res.json(shuttle);
};
const deleteShuttle = async (req, res) => {
	if (!await Shuttle.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Shuttle not found' });
	res.status(204).send();
};

module.exports = { listShuttles, getShuttle, createShuttle, updateShuttle, deleteShuttle };
