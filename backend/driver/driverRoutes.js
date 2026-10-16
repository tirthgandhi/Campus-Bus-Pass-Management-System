'use strict';

const express = require('express');
const { protect, authorize } = require('../common/middleware/authMiddleware');
const { wrap } = require('../common/utils/http');
const controller = require('./controllers/driverController');

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────
router.post('/register', wrap(controller.registerDriver));

// ─── PROTECTED ROUTES (Driver JWT Required) ──────────────────────────────────
router.use(protect, authorize('driver'));

// Profile
router.get('/profile', wrap(controller.getProfile));
router.put('/profile', wrap(controller.updateProfile));

// Assigned Bus (both /assigned-bus and frontend alias /bus)
router.get('/assigned-bus', wrap(controller.getAssignedBus));
router.get('/bus', wrap(controller.getAssignedBus));

// Assigned Route (both /assigned-route and frontend alias /route)
router.get('/assigned-route', wrap(controller.getAssignedRoute));
router.get('/route', wrap(controller.getAssignedRoute));

// Pickup Points (both /pickup-points and frontend alias /route/pickup-points)
router.get('/pickup-points', wrap(controller.getPickupPoints));
router.get('/route/pickup-points', wrap(controller.getPickupPoints));

// Assigned Students
router.get('/students', wrap(controller.getAssignedStudents));

// Bus Pass Verification
router.post('/verify-bus-pass', wrap(controller.verifyBusPass));

// Attendance marking
router.post('/attendance', wrap(controller.markAttendance));

// Today's Attendance (placed before generic /attendance route)
router.get('/attendance/today', wrap(controller.getTodayAttendance));

// Attendance History
router.get('/attendance', wrap(controller.getAttendanceHistory));

// Dashboard & Problem Reporting (Driver UI integration)
router.get('/dashboard', wrap(controller.getDriverDashboard));
router.post('/report-problem', wrap(controller.reportProblem));
router.get('/problems', wrap(controller.getMyProblems));

module.exports = router;
