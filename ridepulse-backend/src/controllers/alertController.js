const Alert = require('../models/Alert');

const listAlerts = async (req, res) => res.json(await Alert.find({ status: 'active' }).populate('affectedShuttle affectedRoute').sort({ createdAt: -1 }));
const createAlert = async (req, res) => {
	const alert = await Alert.create(req.body);
	req.app.get('io').emit('alert:created', alert);
	res.status(201).json(alert);
};
const updateAlert = async (req, res) => res.json(await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
const deleteAlert = async (req, res) => { await Alert.findByIdAndDelete(req.params.id); res.status(204).send(); };

module.exports = { listAlerts, createAlert, updateAlert, deleteAlert };
