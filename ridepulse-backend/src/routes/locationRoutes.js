const express = require('express');
const controller = require('../controllers/locationController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/update', protect, allowRoles('driver', 'admin'), controller.updateGpsLocation);
router.get('/:shuttleId', protect, controller.getLatestLocation);
router.get('/:shuttleId/history', protect, controller.getLocationHistory);

module.exports = router;
