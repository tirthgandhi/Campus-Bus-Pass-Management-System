'use strict';
const express = require('express');
const { protect, authorize } = require('../common/middleware/authMiddleware');
const { wrap, id } = require('../common/utils/http');
const controller = require('./controllers/adminController');

const router = express.Router();

// ── Every admin route requires a valid JWT + admin role ──────────────────────
router.use(protect, authorize('admin'));

// Validate :id param as a MongoDB ObjectId on all parameterised routes.
router.param('id', (req, res, next, value) => {
  try { id(value); next(); } catch (error) { next(error); }
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', wrap(controller.getDashboard));

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/profile', wrap(controller.getProfile));
router.put('/profile', wrap(controller.updateProfile));

// ── Students ──────────────────────────────────────────────────────────────────
// NOTE: static route /students/allocate must come before /students/:id
router.get('/students', wrap(controller.getStudents));
router.post('/students', wrap(controller.createStudent));
router.post('/students/allocate', wrap(controller.allocateStudentToBus));  // legacy alias
router.get('/students/:id', wrap(controller.getStudentById));
router.put('/students/:id', wrap(controller.updateStudent));
router.delete('/students/:id', wrap(controller.deleteStudent));

// ── Drivers ───────────────────────────────────────────────────────────────────
router.get('/drivers', wrap(controller.getDrivers));
router.post('/drivers', wrap(controller.createDriver));
router.get('/drivers/:id', wrap(controller.getDriverById));
router.put('/drivers/:id', wrap(controller.updateDriver));
router.delete('/drivers/:id', wrap(controller.deleteDriver));

// ── Buses ─────────────────────────────────────────────────────────────────────
router.get('/buses', wrap(controller.getBuses));
router.post('/buses', wrap(controller.createBus));
router.get('/buses/:id', wrap(controller.getBusById));
router.put('/buses/:id', wrap(controller.updateBus));
router.delete('/buses/:id', wrap(controller.deleteBus));
// Driver ↔ Bus assignment (sub-resource, no extra :id param needed)
router.put('/buses/:id/driver', wrap(controller.assignDriverToBus));
router.delete('/buses/:id/driver', wrap(controller.unassignDriverFromBus));

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/routes', wrap(controller.getRoutes));
router.post('/routes', wrap(controller.createRoute));
router.get('/routes/:id', wrap(controller.getRouteById));
router.put('/routes/:id', wrap(controller.updateRoute));
router.delete('/routes/:id', wrap(controller.deleteRoute));
// Driver → Route assignment
router.put('/routes/:id/driver', wrap(controller.assignDriverToRoute));

// ── Pickup Points ─────────────────────────────────────────────────────────────
router.get('/pickup-points', wrap(controller.getPickupPoints));
router.post('/pickup-points', wrap(controller.createPickupPoint));
router.get('/pickup-points/:id', wrap(controller.getPickupPointById));
router.put('/pickup-points/:id', wrap(controller.updatePickupPoint));
router.delete('/pickup-points/:id', wrap(controller.deletePickupPoint));

// ── Transport Requests ────────────────────────────────────────────────────────
// NOTE: static sub-paths (pending) before /:id
router.get('/transport-requests', wrap(controller.getTransportRequests));
router.get('/transport-requests/pending', wrap(controller.getPendingTransportRequests));
router.get('/transport-requests/:id', wrap(controller.getTransportRequestById));
router.put('/transport-requests/:id/approve', wrap(controller.approveTransportRequest));
router.put('/transport-requests/:id/reject', wrap(controller.rejectTransportRequest));

// ── Bus Assignments ───────────────────────────────────────────────────────────
router.get('/assignments', wrap(controller.getAssignments));
router.post('/assignments', wrap(controller.createAssignment));
router.get('/assignments/:id', wrap(controller.getAssignmentById));
router.put('/assignments/:id', wrap(controller.updateAssignment));

// ── Attendance (read-only for admin) ─────────────────────────────────────────
router.get('/attendance', wrap(controller.getAttendance));

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports', wrap(controller.getReports));

module.exports = router;
