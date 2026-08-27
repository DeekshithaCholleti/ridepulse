const express = require('express');
const controller = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', protect, allowRoles('admin'), controller.listUsers);
router.get('/drivers', protect, allowRoles('admin'), controller.listDrivers);
router.post('/drivers', protect, allowRoles('admin'), controller.createDriver);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteUser);

module.exports = router;
