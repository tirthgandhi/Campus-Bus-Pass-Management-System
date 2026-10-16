'use strict';
const express = require('express');
const { protect, authorize } = require('../common/middleware/authMiddleware');
const { wrap } = require('../common/utils/http');
const c = require('./controllers/passController');
const { signup } = require('../common/controllers/authController');

const router = express.Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
// POST /api/students/register  — same logic as /api/auth/signup with role=student
router.post('/register', (req, res, next) => {
  // Force role to student so the shared signup controller works correctly
  req.body.role = 'student';
  next();
}, wrap(signup));

// ─── PROTECTED (student JWT required) ────────────────────────────────────────
router.use(protect, authorize('student'));

// Profile
router.get('/profile',            wrap(c.getProfile));
router.put('/profile',            wrap(c.updateProfile));

// Pickup points
router.get('/pickup-points',      wrap(c.getPickupPoints));

// Transport request
router.post('/transport-request', wrap(c.submitTransportRequest));
router.get('/transport-request',  wrap(c.getTransportRequest));

// Bus assignment
router.get('/assignment',         wrap(c.getAssignment));

// Bus pass (sourced from BusAssignment — no BusPass model)
router.get('/bus-pass',           wrap(c.getMyBusPass));

// Attendance history (read-only)
router.get('/attendance',         wrap(c.getAttendance));

// Dashboard summary
router.get('/dashboard',          wrap(c.getDashboard));

// ─── LEGACY ALIASES ──────────────────────────────────────────────────────────
router.post('/passes',            wrap(c.submitTransportRequest));
router.get('/passes/my',          wrap(c.getMyPasses));
router.get('/buspasses/my',       wrap(c.getMyBusPass));

module.exports = router;
