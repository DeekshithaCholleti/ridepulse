const Route = require('../models/Route');

const listRoutes = async (req, res) => res.json(await Route.find().sort({ routeName: 1 }));
const getRoute = async (req, res) => {
	const route = await Route.findById(req.params.id);
	if (!route) return res.status(404).json({ message: 'Route not found' });
	res.json(route);
};
const createRoute = async (req, res) => res.status(201).json(await Route.create(req.body));
const updateRoute = async (req, res) => res.json(await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
const deleteRoute = async (req, res) => { await Route.findByIdAndDelete(req.params.id); res.status(204).send(); };

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute };
