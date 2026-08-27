const express = require('express');
const controller = require('../controllers/routeController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, controller.listRoutes);
router.get('/:id', protect, controller.getRoute);
router.post('/', protect, allowRoles('admin'), controller.createRoute);
router.put('/:id', protect, allowRoles('admin'), controller.updateRoute);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteRoute);

module.exports = router;
