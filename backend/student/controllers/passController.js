'use strict';
const mongoose = require('mongoose');
const Student = require('../../database/models/Student');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { ok, fail, found, id, pick, text } = require('../../common/utils/http');
const { phone } = require('../../common/services/accounts');

// ─── PROFILE ─────────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => ok(res, req.account, 'Student profile fetched successfully');

exports.updateProfile = async (req, res) => {
  const changes = pick(req.body, ['name', 'phone', 'department', 'semester']);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.department !== undefined) changes.department = text(changes.department, 'Department');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  Object.assign(req.account, changes);
  await req.account.save();
  return ok(res, req.account, 'Profile updated successfully');
};

// ─── PICKUP POINTS ────────────────────────────────────────────────────────────

exports.getPickupPoints = async (req, res) => {
  const activeRoutes = await Route.find({ status: 'active' }).select('_id');
  const points = await PickupPoint.find({
    status: 'active',
    route: { $in: activeRoutes.map(r => r._id) },
  })
    .populate('route', 'routeName routeCode startPoint endPoint timings status')
    .sort({ route: 1, sequence: 1 });
  return ok(res, points, 'Pickup points fetched successfully');
};

// ─── TRANSPORT REQUEST ────────────────────────────────────────────────────────

exports.submitTransportRequest = async (req, res) => {
  const pickupId = id(req.body.pickupPointId ?? req.body.pickupPoint, 'pickup point ID');
  const pickup = found(
    await PickupPoint.findById(pickupId).populate('route'),
    'Pickup point'
  );
  if (pickup.status !== 'active') fail(409, 'Pickup point is inactive.');
  if (!pickup.route || pickup.route.status !== 'active') fail(409, 'The route for this pickup point is inactive.');

  if (await BusAssignment.exists({ student: req.user.id, status: 'active' }))
    fail(409, 'You already have an active transport assignment.');

  if (await TransportRequest.exists({ student: req.user.id, status: { $in: ['pending', 'approved'] } }))
    fail(409, 'You already have an active transport request.');

  const request = await TransportRequest.create({
    student: req.user.id,
    pickupPoint: pickupId,
    requestedRoute: pickup.route._id,
  });

  await Student.updateOne({ _id: req.user.id }, { $set: { transportStatus: 'pending' } });

  return ok(res, request, 'Transport request submitted successfully', 201);
};

exports.getTransportRequest = async (req, res) => {
  const request = await TransportRequest.findOne({ student: req.user.id })
    .populate('pickupPoint requestedRoute')
    .sort({ createdAt: -1 });
  if (!request) fail(404, 'No transport request found.');
  return ok(res, request, 'Transport request fetched successfully');
};

// ─── BUS ASSIGNMENT ───────────────────────────────────────────────────────────

exports.getAssignment = async (req, res) => {
  const assignment = await BusAssignment.findOne({ student: req.user.id, status: 'active' })
    .populate('bus', 'busNumber registrationNumber capacity busType status assignedDriver')
    .populate('route', 'routeName routeCode startPoint endPoint timings status assignedDriver')
    .populate('pickupPoint', 'name location landmark pickupTime sequence status');

  if (!assignment) fail(404, 'No bus assignment found.');
  return ok(res, assignment, 'Bus assignment fetched successfully');
};

// ─── BUS PASS ─────────────────────────────────────────────────────────────────

exports.getMyBusPass = async (req, res) => {
  const assignment = await BusAssignment.findOne({ student: req.user.id, status: 'active' })
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode startPoint endPoint timings')
    .populate('pickupPoint', 'name pickupTime');

  if (!assignment) {
    if (req.path === '/buspasses/my' || req.originalUrl?.includes('/buspasses/my')) {
      return ok(res, null);
    }
    fail(404, 'Bus pass is not available yet.');
  }

  return ok(res, {
    busPassId: assignment.busPassId,
    assignedAt: assignment.assignedAt,
    status: assignment.status,
    student: {
      name: req.account.name,
      studentId: req.account.studentId,
      department: req.account.department,
      semester: req.account.semester,
    },
    bus: assignment.bus,
    route: assignment.route,
    pickupPoint: assignment.pickupPoint,
  }, 'Bus pass details fetched successfully');
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

exports.getAttendance = async (req, res) => {
  const filter = { student: req.user.id };

  if (req.query.status) {
    const s = req.query.status.toLowerCase();
    if (!['present', 'absent'].includes(s)) fail(400, 'Status must be present or absent.');
    filter.status = s;
  }

  if (req.query.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.date)) fail(400, 'Date must use YYYY-MM-DD format.');
    const d = new Date(`${req.query.date}T00:00:00.000Z`);
    if (!Number.isFinite(d.getTime())) fail(400, 'Invalid date.');
    filter.date = d;
  }

  if (req.query.month) {
    const m = parseInt(req.query.month, 10);
    if (!Number.isInteger(m) || m < 1 || m > 12) fail(400, 'Month must be 1–12.');
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    filter.date = {
      $gte: new Date(Date.UTC(year, m - 1, 1)),
      $lt: new Date(Date.UTC(year, m, 1)),
    };
  }

  const records = await Attendance.find(filter)
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .sort({ date: -1 });

  return ok(res, records, 'Attendance history fetched successfully');
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  const studentId = req.user.id;

  // Run all queries in parallel
  const [request, assignment, attendanceCounts] = await Promise.all([
    TransportRequest.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .populate('pickupPoint', 'name pickupTime')
      .populate('requestedRoute', 'routeName routeCode'),

    BusAssignment.findOne({ student: studentId, status: 'active' })
      .populate('bus', 'busNumber')
      .populate('route', 'routeName routeCode timings')
      .populate('pickupPoint', 'name pickupTime'),

    Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Summarise attendance counts
  const presentCount = attendanceCounts.find(a => a._id === 'present')?.count ?? 0;
  const absentCount = attendanceCounts.find(a => a._id === 'absent')?.count ?? 0;
  const totalCount = presentCount + absentCount;

  return ok(res, {
    student: {
      name: req.account.name,
      studentId: req.account.studentId,
      department: req.account.department,
      transportStatus: req.account.transportStatus,
    },
    transportRequest: request
      ? {
          status: request.status,
          rejectionReason: request.rejectionReason ?? null,
          pickupPoint: request.pickupPoint,
          route: request.requestedRoute,
          requestDate: request.requestDate,
        }
      : null,
    assignment: assignment
      ? {
          busPassId: assignment.busPassId,
          bus: assignment.bus,
          route: assignment.route,
          pickupPoint: assignment.pickupPoint,
          assignedAt: assignment.assignedAt,
        }
      : null,
    attendance: {
      present: presentCount,
      absent: absentCount,
      total: totalCount,
      percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
    },
  }, 'Dashboard data fetched successfully');
};

// ─── LEGACY ALIASES (kept for backward compatibility) ─────────────────────────
// These were referenced by the old route /passes and /passes/my
exports.applyForPass = exports.submitTransportRequest;
exports.getMyPasses = async (req, res) => ok(res, await TransportRequest.find({ student: req.user.id }).populate('pickupPoint requestedRoute').sort({ createdAt: -1 }));
