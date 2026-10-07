const express = require('express');
const { protect, authorize } = require('../common/middleware/authMiddleware');
const { wrap } = require('../common/utils/http');
const controller = require('./controllers/studentController');
const router = express.Router();
router.use(protect, authorize('student'));
router.get('/profile', wrap(controller.getProfile));
router.put('/profile', wrap(controller.updateProfile));
router.get('/pickup-points', wrap(controller.getPickupPoints));
// Existing transport-request and assignment URLs are preserved.
router.post('/passes', wrap(controller.applyForPass));
router.get('/passes/my', wrap(controller.getMyPasses));
router.get('/buspasses/my', wrap(controller.getMyBusPass));
router.get('/attendance', wrap(controller.getAttendance));
module.exports = router;
