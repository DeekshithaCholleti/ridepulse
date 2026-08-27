const express = require('express');
const controller = require('../controllers/shuttleController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, controller.listShuttles);
router.get('/:id', protect, controller.getShuttle);
router.post('/', protect, allowRoles('admin'), controller.createShuttle);
router.put('/:id', protect, allowRoles('admin', 'driver'), controller.updateShuttle);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteShuttle);

module.exports = router;
