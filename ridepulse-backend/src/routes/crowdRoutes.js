const express = require('express');
const controller = require('../controllers/crowdController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/:shuttleId', protect, controller.getCrowd);
router.put('/:shuttleId', protect, allowRoles('driver', 'admin'), controller.updateCrowd);

module.exports = router;
