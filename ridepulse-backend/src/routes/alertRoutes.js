const express = require('express');
const controller = require('../controllers/alertController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, controller.listAlerts);
router.post('/', protect, allowRoles('admin'), controller.createAlert);
router.put('/:id', protect, allowRoles('admin'), controller.updateAlert);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteAlert);

module.exports = router;
