'use strict';
const mongoose = require('mongoose');
const Bus = require('../../database/models/Bus');
const Driver = require('../../database/models/Driver');
const Student = require('../../database/models/Student');
const Admin = require('../../database/models/Admin');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { allocate, assignDriver } = require('../../common/services/assignments');
const { ok, fail, found, id, pick, text, sameId, day } = require('../../common/utils/http');
const { phone, email, password } = require('../../common/services/accounts');
const { emailPattern, phonePattern } = require('../../database/helpers/account');

// ─── Field allow-lists ──────────────────────────────────────────────────────
const busFields = ['busNumber', 'registrationNumber', 'capacity', 'busType', 'status'];
const routeFields = ['routeName', 'routeCode', 'description', 'startPoint', 'endPoint', 'status', 'timings'];
const pickupFields = ['name', 'location', 'landmark', 'route', 'sequence', 'status', 'pickupTime'];

// ─── Helpers ────────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePage(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function withPagination(res, data, total, page, limit, message = 'Fetched successfully') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// Safely parse ObjectId from a query param (returns null if absent/invalid)
function optionalId(value, label) {
  if (!value) return null;
  if (!mongoose.isObjectIdOrHexString(value)) fail(400, `Invalid ${label}.`);
  return value;
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const [
    totalStudents,
    totalDrivers,
    totalBuses,
    activeRoutes,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    activeAssignments,
    todayAttendanceCount,
    recentRequests,
  ] = await Promise.all([
    Student.countDocuments(),
    Driver.countDocuments(),
    Bus.countDocuments(),
    Route.countDocuments({ status: 'active' }),
    TransportRequest.countDocuments({ status: 'pending' }),
    TransportRequest.countDocuments({ status: 'approved' }),
    TransportRequest.countDocuments({ status: 'rejected' }),
    BusAssignment.countDocuments({ status: 'active' }),
    Attendance.countDocuments({ date: day() }),
    TransportRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name studentId collegeEmail')
      .populate('pickupPoint', 'name')
      .populate('requestedRoute', 'routeName'),
  ]);

  return ok(res, {
    totalStudents,
    totalDrivers,
    totalBuses,
    activeRoutes,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    activeAssignments,
    todayAttendance: todayAttendanceCount,
    recentRequests,
  }, 'Dashboard data fetched successfully');
};

// ─── ADMIN PROFILE ───────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const admin = found(await Admin.findById(req.user.id), 'Admin');
  return ok(res, admin, 'Profile fetched');
};

exports.updateProfile = async (req, res) => {
  const admin = found(await Admin.findById(req.user.id), 'Admin');
  const allowed = ['name', 'phone', 'department'];
  const changes = pick(req.body, allowed);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  Object.assign(admin, changes);
  await admin.save();
  return ok(res, admin, 'Profile updated');
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { studentId: regex }, { collegeEmail: regex }];
  }
  if (req.query.status && ['pending', 'approved', 'rejected', 'inactive'].includes(req.query.status)) {
    filter.transportStatus = req.query.status;
  }
  if (req.query.department) {
    filter.department = new RegExp(escapeRegex(req.query.department.trim()), 'i');
  }

  const allowedSorts = { name: 'name', createdAt: 'createdAt', enrollmentNumber: 'studentId' };
  const sortField = allowedSorts[req.query.sort] || 'createdAt';
  const sortDir = req.query.order === 'asc' ? 1 : -1;

  const [data, total] = await Promise.all([
    Student.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return withPagination(res, data, total, page, limit, 'Students fetched successfully');
};

exports.getStudentById = async (req, res) => {
  const student = found(await Student.findById(req.params.id), 'Student');
  const [latestRequest, currentAssignment] = await Promise.all([
    TransportRequest.findOne({ student: student._id })
      .sort({ createdAt: -1 })
      .populate('pickupPoint', 'name location')
      .populate('requestedRoute', 'routeName routeCode')
      .populate('reviewedBy', 'name email'),
    BusAssignment.findOne({ student: student._id, status: 'active' })
      .populate('bus', 'busNumber registrationNumber capacity')
      .populate('route', 'routeName routeCode')
      .populate('pickupPoint', 'name location pickupTime'),
  ]);
  return ok(res, { student, latestRequest, currentAssignment }, 'Student fetched');
};

exports.createStudent = async (req, res) => {
  const { body } = req;
  const name = text(body.name, 'Name');
  const studentId = text(body.enrollmentNumber || body.studentId, 'Enrollment number', { max: 60 }).toUpperCase();
  const collegeEmail = (() => {
    const v = text(body.collegeEmail || body.email, 'College email', { max: 254 }).toLowerCase();
    if (!emailPattern.test(v)) fail(400, 'Enter a valid college email address.');
    return v;
  })();
  const phoneNum = phone(body.phone);
  const department = text(body.department, 'Department');
  const pw = body.password;
  if (typeof pw !== 'string' || pw.length < 8 || Buffer.byteLength(pw, 'utf8') > 72) {
    fail(400, 'Password must be at least 8 characters and at most 72 UTF-8 bytes.');
  }
  const transportStatus = (['pending', 'approved', 'rejected', 'inactive'].includes(body.status)) ? body.status : 'pending';
  const exists = await Student.exists({ $or: [{ studentId }, { collegeEmail }] });
  if (exists) fail(409, 'A student with this enrollment number or email already exists.');
  const student = await Student.create({
    name,
    studentId,
    collegeEmail,
    phone: phoneNum,
    department,
    password: pw,
    transportStatus,
    isVerified: true,
    ...(body.semester ? { semester: parseInt(body.semester, 10) } : {}),
  });
  return ok(res, student, 'Student created', 201);
};

exports.updateStudent = async (req, res) => {
  const student = found(await Student.findById(req.params.id), 'Student');
  const allowed = ['name', 'phone', 'department', 'semester', 'transportStatus'];
  const changes = pick(req.body, allowed);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  if (changes.transportStatus !== undefined && !['pending', 'approved', 'rejected', 'inactive'].includes(changes.transportStatus)) {
    fail(400, 'Invalid transport status.');
  }

  // Handle email & enrollmentNumber changes with duplicate check
  const emailUpdate = req.body.collegeEmail || req.body.email;
  if (emailUpdate !== undefined) {
    const norm = text(emailUpdate, 'College email', { max: 254 }).toLowerCase();
    if (!emailPattern.test(norm)) fail(400, 'Enter a valid college email address.');
    if (!sameId(student.collegeEmail, norm)) {
      if (await Student.exists({ collegeEmail: norm, _id: { $ne: student._id } })) {
        fail(409, 'This email is already in use by another student.');
      }
      changes.collegeEmail = norm;
    }
  }
  const enrollmentUpdate = req.body.enrollmentNumber || req.body.studentId;
  if (enrollmentUpdate !== undefined) {
    const norm = enrollmentUpdate.trim().toUpperCase();
    if (student.studentId !== norm) {
      if (await Student.exists({ studentId: norm, _id: { $ne: student._id } })) {
        fail(409, 'This enrollment number is already in use.');
      }
      changes.studentId = norm;
    }
  }

  Object.assign(student, changes);
  await student.save();
  return ok(res, student, 'Student updated');
};

exports.deleteStudent = async (req, res) => {
  const student = found(await Student.findById(req.params.id), 'Student');
  if (await BusAssignment.exists({ student: student._id, status: 'active' })) {
    fail(409, 'Student cannot be deleted while an active bus assignment exists.');
  }
  if (await TransportRequest.exists({ student: student._id, status: { $in: ['pending', 'approved'] } })) {
    fail(409, 'Student cannot be deleted while a pending or approved transport request exists.');
  }
  await student.deleteOne();
  return ok(res, {}, 'Student deleted');
};

// ─── DRIVERS ─────────────────────────────────────────────────────────────────
exports.getDrivers = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { licenseNumber: regex }];
  }
  if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [data, total] = await Promise.all([
    Driver.find(filter).populate('assignedBus assignedRoute').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Driver.countDocuments(filter),
  ]);
  return withPagination(res, data, total, page, limit, 'Drivers fetched successfully');
};

exports.getDriverById = async (req, res) => {
  const driver = found(await Driver.findById(req.params.id).populate('assignedBus assignedRoute'), 'Driver');
  return ok(res, driver, 'Driver fetched');
};

exports.createDriver = async (req, res) => {
  const { body } = req;
  const name = text(body.name, 'Name');
  const driverEmail = email(body.email);
  const phoneNum = phone(body.phone);
  const licenseNumber = text(body.licenseNumber, 'License number', { max: 60 }).toUpperCase();
  const pw = body.password;
  if (typeof pw !== 'string' || pw.length < 8 || Buffer.byteLength(pw, 'utf8') > 72) {
    fail(400, 'Password must be at least 8 characters and at most 72 UTF-8 bytes.');
  }
  const status = ['active', 'inactive'].includes(body.status) ? body.status : 'active';
  const exists = await Driver.exists({ $or: [{ email: driverEmail }, { licenseNumber }] });
  if (exists) fail(409, 'A driver with this email or license number already exists.');
  const driver = await Driver.create({ name, email: driverEmail, phone: phoneNum, licenseNumber, password: pw, status });
  return ok(res, driver, 'Driver created', 201);
};

exports.updateDriver = async (req, res) => {
  const driver = found(await Driver.findById(req.params.id), 'Driver');
  const changes = pick(req.body, ['name', 'phone', 'status']);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  if (changes.status !== undefined && !['active', 'inactive'].includes(changes.status)) {
    fail(400, 'Invalid status. Must be active or inactive.');
  }
  if (req.body.email !== undefined) {
    const norm = email(req.body.email);
    if (driver.email !== norm) {
      if (await Driver.exists({ email: norm, _id: { $ne: driver._id } })) {
        fail(409, 'This email is already in use by another driver.');
      }
      changes.email = norm;
    }
  }
  if (req.body.licenseNumber !== undefined) {
    const norm = req.body.licenseNumber.trim().toUpperCase();
    if (driver.licenseNumber !== norm) {
      if (await Driver.exists({ licenseNumber: norm, _id: { $ne: driver._id } })) {
        fail(409, 'This license number is already in use.');
      }
      changes.licenseNumber = norm;
    }
  }
  Object.assign(driver, changes);
  await driver.save();
  return ok(res, driver, 'Driver updated');
};

exports.deleteDriver = async (req, res) => {
  const driver = found(await Driver.findById(req.params.id), 'Driver');
  if (driver.assignedBus) {
    fail(409, 'Driver cannot be deleted while assigned to a bus. Remove the bus assignment first.');
  }
  if (await Attendance.exists({ driver: driver._id })) {
    fail(409, 'Driver cannot be deleted because attendance records reference this driver.');
  }
  await driver.deleteOne();
  return ok(res, {}, 'Driver deleted');
};

// ─── BUSES ───────────────────────────────────────────────────────────────────
exports.getBuses = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ busNumber: regex }, { registrationNumber: regex }];
  }
  if (req.query.status && ['active', 'inactive', 'maintenance'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [data, total] = await Promise.all([
    Bus.find(filter).populate('assignedDriver').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Bus.countDocuments(filter),
  ]);
  return withPagination(res, data, total, page, limit, 'Buses fetched successfully');
};

exports.getBusById = async (req, res) => {
  const bus = found(await Bus.findById(req.params.id).populate('assignedDriver'), 'Bus');
  return ok(res, bus, 'Bus fetched');
};

exports.createBus = async (req, res) => {
  const { body } = req;
  const busNumber = text(body.busNumber, 'Bus number', { max: 30 }).toUpperCase();
  const registrationNumber = text(body.registrationNumber, 'Registration number', { max: 30 }).toUpperCase();
  const capacity = parseInt(body.capacity, 10);
  if (!Number.isInteger(capacity) || capacity < 1) fail(400, 'Capacity must be a positive integer.');
  const busType = ['university', 'hired'].includes(body.busType) ? body.busType : 'university';
  const status = ['active', 'inactive', 'maintenance'].includes(body.status) ? body.status : 'active';
  const exists = await Bus.exists({ $or: [{ busNumber }, { registrationNumber }] });
  if (exists) fail(409, 'A bus with this number or registration already exists.');
  const data = { busNumber, registrationNumber, capacity, busType, status };
  if (body.assignedDriver) {
    const dId = id(body.assignedDriver, 'driver ID');
    found(await Driver.findById(dId), 'Driver');
    data.assignedDriver = dId;
  }
  const bus = await Bus.create(data);
  return ok(res, bus, 'Bus created', 201);
};

exports.updateBus = async (req, res) => {
  const bus = await mongoose.connection.transaction(async session => {
    const record = found(await Bus.findById(req.params.id).session(session), 'Bus');
    const changes = pick(req.body, busFields);
    if (changes.capacity !== undefined) {
      const cap = parseInt(changes.capacity, 10);
      if (!Number.isInteger(cap) || cap < 1) fail(400, 'Capacity must be a positive integer.');
      if (cap < await BusAssignment.countDocuments({ bus: record._id, status: 'active' }).session(session)) {
        fail(409, 'Capacity cannot be lower than the current number of active assignments.');
      }
      changes.capacity = cap;
    }
    if (changes.status !== undefined && !['active', 'inactive', 'maintenance'].includes(changes.status)) {
      fail(400, 'Invalid bus status.');
    }
    Object.assign(record, changes);
    await record.save({ session });
    return record;
  });
  return ok(res, bus, 'Bus updated');
};

exports.deleteBus = async (req, res) => {
  const bus = found(await Bus.findById(req.params.id), 'Bus');
  if (await BusAssignment.exists({ bus: bus._id })) fail(409, 'This bus has assignment records. Mark it inactive instead.');
  if (await Attendance.exists({ bus: bus._id })) fail(409, 'This bus has attendance records. Mark it inactive instead.');
  if (await Driver.exists({ assignedBus: bus._id })) fail(409, 'A driver is currently assigned to this bus. Remove the driver assignment first.');
  if (await Route.exists({ assignedBus: bus._id })) fail(409, 'This bus is assigned to a route. Remove the route assignment first.');
  await bus.deleteOne();
  return ok(res, {}, 'Bus deleted');
};

exports.assignDriverToBus = async (req, res) => {
  const result = await assignDriver(req.params.id, id(req.body.driverId, 'driver ID'), req.body.routeId || null);
  return ok(res, result, 'Driver assigned to bus');
};

exports.unassignDriverFromBus = async (req, res) => {
  await mongoose.connection.transaction(async session => {
    const bus = found(await Bus.findById(req.params.id).session(session), 'Bus');
    if (!bus.assignedDriver) fail(409, 'This bus does not have a driver assigned.');
    const driver = await Driver.findById(bus.assignedDriver).session(session);
    if (driver) {
      driver.assignedBus = null;
      if (driver.assignedRoute && sameId(driver.assignedRoute, await Route.findOne({ assignedBus: bus._id }).select('_id').session(session))) {
        driver.assignedRoute = null;
      }
      await driver.save({ session });
    }
    await Route.updateMany({ assignedBus: bus._id, assignedDriver: bus.assignedDriver }, { $set: { assignedDriver: null } }, { session });
    bus.assignedDriver = null;
    await bus.save({ session });
  });
  return ok(res, {}, 'Driver unassigned from bus');
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────
exports.createRoute = async (req, res) => {
  const data = pick(req.body, routeFields);
  if (!data.routeName) fail(400, 'Route name is required.');
  if (!data.routeCode) fail(400, 'Route code is required.');
  if (!data.startPoint) fail(400, 'Start point is required.');
  if (!data.endPoint) fail(400, 'End point is required.');
  if (req.body.assignedBus) {
    const busId = id(req.body.assignedBus, 'bus ID');
    found(await Bus.findById(busId), 'Bus');
    data.assignedBus = busId;
  }
  const exists = await Route.exists({ routeCode: data.routeCode });
  if (exists) fail(409, 'A route with this code already exists.');
  return ok(res, await Route.create(data), 'Route created', 201);
};

exports.getRoutes = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ routeName: regex }, { routeCode: regex }];
  }
  if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [data, total] = await Promise.all([
    Route.find(filter).populate('pickupPoints assignedBus assignedDriver').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Route.countDocuments(filter),
  ]);
  return withPagination(res, data, total, page, limit, 'Routes fetched successfully');
};

exports.getRouteById = async (req, res) => {
  const route = found(await Route.findById(req.params.id).populate('pickupPoints assignedBus assignedDriver'), 'Route');
  return ok(res, route, 'Route fetched');
};

exports.updateRoute = async (req, res) => {
  const route = found(await Route.findById(req.params.id), 'Route');
  if (req.body.assignedBus !== undefined) {
    const busId = id(req.body.assignedBus, 'bus ID');
    if (route.assignedBus && !sameId(route.assignedBus, busId)) fail(409, 'This route already has an assigned bus.');
    found(await Bus.findById(busId), 'Bus');
    route.assignedBus = busId;
  }
  if (req.body.routeCode && req.body.routeCode !== route.routeCode) {
    if (await Route.exists({ routeCode: req.body.routeCode, _id: { $ne: route._id } })) {
      fail(409, 'A route with this code already exists.');
    }
  }
  Object.assign(route, pick(req.body, routeFields));
  await route.save();
  return ok(res, route, 'Route updated');
};

exports.deleteRoute = async (req, res) => {
  const route = found(await Route.findById(req.params.id), 'Route');
  if (await PickupPoint.exists({ route: route._id })) fail(409, 'This route has pickup points. Remove them first.');
  if (await TransportRequest.exists({ requestedRoute: route._id })) fail(409, 'This route is referenced by transport requests. Mark it inactive instead.');
  if (await BusAssignment.exists({ route: route._id })) fail(409, 'This route has active assignments. Mark it inactive instead.');
  if (await Attendance.exists({ route: route._id })) fail(409, 'This route has attendance records. Mark it inactive instead.');
  if (await Driver.exists({ assignedRoute: route._id })) fail(409, 'A driver is assigned to this route. Remove the assignment first.');
  await route.deleteOne();
  return ok(res, {}, 'Route deleted');
};

// ─── PICKUP POINTS ────────────────────────────────────────────────────────────
exports.createPickupPoint = async (req, res) => {
  id(req.body.route, 'route ID');
  const pickup = await mongoose.connection.transaction(async session => {
    found(await Route.findById(req.body.route).session(session), 'Route');
    const [record] = await PickupPoint.create([pick(req.body, pickupFields)], { session });
    await Route.updateOne({ _id: record.route }, { $addToSet: { pickupPoints: record._id } }, { session });
    return record;
  });
  return ok(res, pickup, 'Pickup point created', 201);
};

exports.getPickupPoints = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { location: regex }];
  }
  if (req.query.route) {
    const routeId = optionalId(req.query.route, 'route ID');
    if (routeId) filter.route = routeId;
  }
  if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [data, total] = await Promise.all([
    PickupPoint.find(filter).populate('route').sort({ route: 1, sequence: 1 }).skip(skip).limit(limit),
    PickupPoint.countDocuments(filter),
  ]);
  return withPagination(res, data, total, page, limit, 'Pickup points fetched successfully');
};

exports.getPickupPointById = async (req, res) => {
  const p = found(await PickupPoint.findById(req.params.id).populate('route'), 'Pickup point');
  return ok(res, p, 'Pickup point fetched');
};

exports.updatePickupPoint = async (req, res) => {
  if (req.body.route !== undefined) id(req.body.route, 'route ID');
  const pickup = await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(req.params.id).session(session), 'Pickup point');
    const oldRoute = record.route;
    const changes = pick(req.body, pickupFields);
    if (changes.route && !sameId(oldRoute, changes.route)) {
      if (await TransportRequest.exists({ pickupPoint: record._id }).session(session) || await BusAssignment.exists({ pickupPoint: record._id }).session(session)) {
        fail(409, 'A pickup point with transportation records cannot change route.');
      }
      found(await Route.findById(changes.route).session(session), 'Route');
      await Route.updateOne({ _id: oldRoute }, { $pull: { pickupPoints: record._id } }, { session });
      await Route.updateOne({ _id: changes.route }, { $addToSet: { pickupPoints: record._id } }, { session });
    }
    Object.assign(record, changes);
    await record.save({ session });
    return record;
  });
  return ok(res, pickup, 'Pickup point updated');
};

exports.deletePickupPoint = async (req, res) => {
  await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(req.params.id).session(session), 'Pickup point');
    if (
      await TransportRequest.exists({ pickupPoint: record._id }).session(session) ||
      await BusAssignment.exists({ pickupPoint: record._id }).session(session) ||
      await Attendance.exists({ pickupPoint: record._id }).session(session)
    ) {
      fail(409, 'This pickup point is referenced by transportation records. Mark it inactive instead.');
    }
    await Route.updateOne({ _id: record.route }, { $pull: { pickupPoints: record._id } }, { session });
    await record.deleteOne({ session });
  });
  return ok(res, {}, 'Pickup point deleted');
};

// ─── TRANSPORT REQUESTS ───────────────────────────────────────────────────────
exports.getTransportRequests = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.status) {
    if (!['pending', 'approved', 'rejected'].includes(req.query.status)) fail(400, 'Invalid request status.');
    filter.status = req.query.status;
  }
  if (req.query.date) {
    const d = day(req.query.date);
    const next = new Date(d); next.setUTCDate(next.getUTCDate() + 1);
    filter.requestDate = { $gte: d, $lt: next };
  }
  // search by student name/ID requires a populate-then-filter; do it via aggregation for large sets
  // For simplicity matching on populated fields we'll do a two-stage fetch when search is provided
  const base = TransportRequest.find(filter)
    .populate('student', 'name studentId collegeEmail phone department')
    .populate('pickupPoint', 'name location')
    .populate('requestedRoute', 'routeName routeCode')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  if (req.query.search) {
    const q = req.query.search.trim().toLowerCase();
    const all = await base;
    const filtered = all.filter(r =>
      (r.student?.name || '').toLowerCase().includes(q) ||
      (r.student?.studentId || '').toLowerCase().includes(q) ||
      String(r._id).toLowerCase().includes(q)
    );
    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);
    return withPagination(res, paged, total, page, limit, 'Transport requests fetched successfully');
  }

  const [data, total] = await Promise.all([base.skip(skip).limit(limit), TransportRequest.countDocuments(filter)]);
  return withPagination(res, data, total, page, limit, 'Transport requests fetched successfully');
};

exports.getPendingTransportRequests = async (req, res) => {
  const requests = await TransportRequest.find({ status: 'pending' })
    .populate('student', 'name studentId collegeEmail phone department')
    .populate('pickupPoint', 'name location')
    .populate('requestedRoute', 'routeName routeCode')
    .sort({ createdAt: -1 });
  return ok(res, requests, 'Pending requests fetched');
};

exports.getTransportRequestById = async (req, res) => {
  const request = found(
    await TransportRequest.findById(req.params.id)
      .populate('student', 'name studentId collegeEmail phone department')
      .populate('pickupPoint', 'name location pickupTime')
      .populate('requestedRoute', 'routeName routeCode startPoint endPoint')
      .populate('reviewedBy', 'name email'),
    'Transport request'
  );
  return ok(res, request, 'Transport request fetched');
};

async function review(req, res, status) {
  const rejectionReason = status === 'rejected'
    ? text(req.body.rejectionReason, 'Rejection reason', { max: 500 })
    : null;
  const request = await mongoose.connection.transaction(async session => {
    const current = found(await TransportRequest.findById(req.params.id).session(session), 'Transport request');
    if (current.status !== 'pending') fail(409, 'This request has already been reviewed.');
    current.status = status;
    current.reviewedBy = req.user.id;
    current.reviewedAt = new Date();
    current.rejectionReason = rejectionReason;
    await current.save({ session });
    const student = found(await Student.findById(current.student).session(session), 'Student');
    if (student.transportStatus === 'inactive') fail(409, 'Student account is inactive.');
    student.transportStatus = status;
    await student.save({ session });
    return current;
  });
  return ok(res, request, `Transport request ${status}`);
}
exports.approveTransportRequest = (req, res) => review(req, res, 'approved');
exports.rejectTransportRequest = (req, res) => review(req, res, 'rejected');

// ─── BUS ASSIGNMENTS ──────────────────────────────────────────────────────────
exports.getAssignments = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};
  if (req.query.status && ['active', 'inactive'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.bus) {
    const busId = optionalId(req.query.bus, 'bus ID');
    if (busId) filter.bus = busId;
  }
  if (req.query.route) {
    const routeId = optionalId(req.query.route, 'route ID');
    if (routeId) filter.route = routeId;
  }

  const base = BusAssignment.find(filter)
    .populate('student', 'name studentId collegeEmail phone department')
    .populate('bus', 'busNumber registrationNumber capacity status')
    .populate('route', 'routeName routeCode status')
    .populate('pickupPoint', 'name location pickupTime status')
    .populate('assignedBy', 'name email')
    .sort({ assignedAt: -1 });

  if (req.query.search) {
    const q = req.query.search.trim().toLowerCase();
    const all = await base;
    const filtered = all.filter(a =>
      (a.student?.name || '').toLowerCase().includes(q) ||
      (a.student?.studentId || '').toLowerCase().includes(q) ||
      (a.busPassId || '').toLowerCase().includes(q)
    );
    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);
    return withPagination(res, paged, total, page, limit, 'Assignments fetched successfully');
  }

  const [data, total] = await Promise.all([base.skip(skip).limit(limit), BusAssignment.countDocuments(filter)]);
  return withPagination(res, data, total, page, limit, 'Assignments fetched successfully');
};

exports.getAssignmentById = async (req, res) => {
  const assignment = found(
    await BusAssignment.findById(req.params.id)
      .populate('student', 'name studentId collegeEmail phone department')
      .populate('bus', 'busNumber registrationNumber capacity status')
      .populate('route', 'routeName routeCode startPoint endPoint status')
      .populate('pickupPoint', 'name location pickupTime status')
      .populate('assignedBy', 'name email'),
    'Assignment'
  );
  return ok(res, assignment, 'Assignment fetched');
};

exports.createAssignment = async (req, res) => {
  const assignment = await allocate(req.body, req.user.id);
  const populated = await BusAssignment.findById(assignment._id)
    .populate('student', 'name studentId collegeEmail')
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .populate('pickupPoint', 'name location pickupTime');
  return ok(res, populated, 'Student assigned successfully', 201);
};

exports.updateAssignment = async (req, res) => {
  const assignment = await mongoose.connection.transaction(async session => {
    const record = found(await BusAssignment.findById(req.params.id).session(session), 'Assignment');
    const changes = {};

    // Status change
    if (req.body.status !== undefined) {
      if (!['active', 'inactive'].includes(req.body.status)) fail(400, 'Invalid assignment status.');
      changes.status = req.body.status;
    }

    // Bus change
    const newBusId = req.body.busId ? id(req.body.busId, 'bus ID') : null;
    const newRouteId = req.body.routeId ? id(req.body.routeId, 'route ID') : null;
    const newPickupId = req.body.pickupPointId ? id(req.body.pickupPointId, 'pickup point ID') : null;

    const busId = newBusId || String(record.bus);
    const routeId = newRouteId || String(record.route);
    const pickupId = newPickupId || String(record.pickupPoint);

    const bus = found(await Bus.findById(busId).session(session), 'Bus');
    const route = found(await Route.findById(routeId).session(session), 'Route');
    const pickup = found(await PickupPoint.findById(pickupId).session(session), 'Pickup point');

    if (!sameId(pickup.route, route)) fail(400, 'Pickup point does not belong to the selected route.');
    if (!sameId(route.assignedBus, bus)) fail(400, 'Bus is not assigned to the selected route.');

    // Capacity check if changing bus
    if (newBusId && !sameId(newBusId, record.bus)) {
      const occupied = await BusAssignment.countDocuments({ bus: busId, status: 'active', _id: { $ne: record._id } }).session(session);
      if (occupied >= bus.capacity) fail(409, 'The selected bus has reached its capacity.');
    }

    if (newBusId) changes.bus = busId;
    if (newRouteId) changes.route = routeId;
    if (newPickupId) changes.pickupPoint = pickupId;

    // busPassId is permanent - never regenerated
    Object.assign(record, changes);
    await record.save({ session });
    return record;
  });
  const populated = await BusAssignment.findById(assignment._id)
    .populate('student', 'name studentId collegeEmail')
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .populate('pickupPoint', 'name location pickupTime')
    .populate('assignedBy', 'name email');
  return ok(res, populated, 'Assignment updated');
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
exports.getAttendance = async (req, res) => {
  const { page, limit, skip } = parsePage(req.query);
  const filter = {};

  // date filter (exact day)
  if (req.query.date) {
    const d = day(req.query.date);
    filter.date = d;
  }

  // month+year filter
  if (req.query.month && req.query.year) {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!Number.isInteger(month) || month < 1 || month > 12) fail(400, 'Month must be between 1 and 12.');
    if (!Number.isInteger(year) || year < 2000 || year > 2100) fail(400, 'Enter a valid year.');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    filter.date = { $gte: start, $lt: end };
  } else if (req.query.year && !req.query.month) {
    const year = parseInt(req.query.year, 10);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) fail(400, 'Enter a valid year.');
    filter.date = { $gte: new Date(Date.UTC(year, 0, 1)), $lt: new Date(Date.UTC(year + 1, 0, 1)) };
  }

  if (req.query.status && ['present', 'absent'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  // relational filters
  const studentId = optionalId(req.query.student, 'student ID');
  if (studentId) filter.student = studentId;
  const busId = optionalId(req.query.bus, 'bus ID');
  if (busId) filter.bus = busId;
  const routeId = optionalId(req.query.route, 'route ID');
  if (routeId) filter.route = routeId;
  const driverId = optionalId(req.query.driver, 'driver ID');
  if (driverId) filter.driver = driverId;

  const [data, total] = await Promise.all([
    Attendance.find(filter)
      .populate('student', 'name studentId collegeEmail')
      .populate('driver', 'name email licenseNumber')
      .populate('bus', 'busNumber registrationNumber')
      .populate('route', 'routeName routeCode')
      .populate('pickupPoint', 'name location')
      .sort({ date: -1, markedAt: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);
  return withPagination(res, data, total, page, limit, 'Attendance fetched successfully');
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  const { type } = req.query;
  if (!['daily', 'monthly', 'yearly'].includes(type)) {
    fail(400, 'Report type must be daily, monthly, or yearly.');
  }

  const busId = optionalId(req.query.busId, 'bus ID');
  const routeId = optionalId(req.query.routeId, 'route ID');

  const attendanceMatch = {};
  const requestMatch = {};
  const assignmentMatch = {};

  if (busId) attendanceMatch.bus = new mongoose.Types.ObjectId(busId);
  if (routeId) { attendanceMatch.route = new mongoose.Types.ObjectId(routeId); assignmentMatch.route = new mongoose.Types.ObjectId(routeId); }

  // ── Daily ─────────────────────────────────────────────────────────────
  if (type === 'daily') {
    const date = req.query.date ? day(req.query.date) : day();
    const nextDay = new Date(date); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const dateFilter = { $gte: date, $lt: nextDay };
    attendanceMatch.date = dateFilter;

    const [
      totalStudents, totalDrivers, totalBuses, activeBuses, activeRoutes, totalAssignments,
      attendanceDocs,
      pendingRequests, approvedRequests, rejectedRequests,
    ] = await Promise.all([
      Student.countDocuments(),
      Driver.countDocuments(),
      Bus.countDocuments(),
      Bus.countDocuments({ status: 'active' }),
      Route.countDocuments({ status: 'active' }),
      BusAssignment.countDocuments({ status: 'active' }),
      Attendance.find(attendanceMatch).select('status student'),
      TransportRequest.countDocuments({ status: 'pending' }),
      TransportRequest.countDocuments({ status: 'approved', reviewedAt: dateFilter }),
      TransportRequest.countDocuments({ status: 'rejected', reviewedAt: dateFilter }),
    ]);
    const present = attendanceDocs.filter(a => a.status === 'present').length;
    const absent = attendanceDocs.filter(a => a.status === 'absent').length;

    return ok(res, {
      reportType: 'daily',
      date: date.toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents, totalDrivers, totalBuses, activeBuses, activeRoutes,
        totalAssignments,
        attendanceRecords: attendanceDocs.length,
        present, absent,
        pendingRequests, approvedRequests, rejectedRequests,
      },
    }, 'Daily report generated successfully');
  }

  // ── Monthly ────────────────────────────────────────────────────────────
  if (type === 'monthly') {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (!Number.isInteger(month) || month < 1 || month > 12) fail(400, 'Month must be between 1 and 12.');
    if (!Number.isInteger(year) || year < 2000 || year > 2100) fail(400, 'Enter a valid year.');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    attendanceMatch.date = { $gte: start, $lt: end };
    assignmentMatch.assignedAt = { $gte: start, $lt: end };

    const [
      transportRequests, approvedRequests, rejectedRequests, pendingRequests,
      newAssignments,
      attendanceRecords,
      attendanceByDateRaw,
    ] = await Promise.all([
      TransportRequest.countDocuments({ requestDate: { $gte: start, $lt: end }, ...requestMatch }),
      TransportRequest.countDocuments({ status: 'approved', reviewedAt: { $gte: start, $lt: end }, ...requestMatch }),
      TransportRequest.countDocuments({ status: 'rejected', reviewedAt: { $gte: start, $lt: end }, ...requestMatch }),
      TransportRequest.countDocuments({ status: 'pending', requestDate: { $gte: start, $lt: end }, ...requestMatch }),
      BusAssignment.countDocuments(assignmentMatch),
      Attendance.countDocuments(attendanceMatch),
      Attendance.aggregate([
        { $match: attendanceMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return ok(res, {
      reportType: 'monthly',
      month, year,
      generatedAt: new Date().toISOString(),
      summary: { transportRequests, approvedRequests, rejectedRequests, pendingRequests, newAssignments, attendanceRecords },
      attendanceByDate: attendanceByDateRaw.map(r => ({ date: r._id, records: r.count, present: r.present })),
    }, 'Monthly report generated successfully');
  }

  // ── Yearly ─────────────────────────────────────────────────────────────
  if (type === 'yearly') {
    const year = parseInt(req.query.year, 10);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) fail(400, 'Enter a valid year.');
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    attendanceMatch.date = { $gte: start, $lt: end };
    assignmentMatch.assignedAt = { $gte: start, $lt: end };

    const [monthlyAttendanceRaw, monthlyRequestsRaw, monthlyAssignmentsRaw] = await Promise.all([
      Attendance.aggregate([
        { $match: attendanceMatch },
        { $group: { _id: { $month: '$date' }, records: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } },
        { $sort: { _id: 1 } },
      ]),
      TransportRequest.aggregate([
        { $match: { requestDate: { $gte: start, $lt: end }, ...requestMatch } },
        { $group: { _id: { $month: '$requestDate' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      BusAssignment.aggregate([
        { $match: { assignedAt: { $gte: start, $lt: end }, ...assignmentMatch } },
        { $group: { _id: { $month: '$assignedAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill all 12 months
    const byMonth = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = { month: m, attendanceRecords: 0, present: 0, transportRequests: 0, newAssignments: 0 };
    monthlyAttendanceRaw.forEach(r => { byMonth[r._id].attendanceRecords = r.records; byMonth[r._id].present = r.present; });
    monthlyRequestsRaw.forEach(r => { byMonth[r._id].transportRequests = r.count; });
    monthlyAssignmentsRaw.forEach(r => { byMonth[r._id].newAssignments = r.count; });

    const totalAttendance = Object.values(byMonth).reduce((s, r) => s + r.attendanceRecords, 0);
    const totalRequests = Object.values(byMonth).reduce((s, r) => s + r.transportRequests, 0);
    const totalAssignments = Object.values(byMonth).reduce((s, r) => s + r.newAssignments, 0);

    return ok(res, {
      reportType: 'yearly',
      year,
      generatedAt: new Date().toISOString(),
      summary: { totalAttendance, totalRequests, totalAssignments },
      monthlyBreakdown: Object.values(byMonth),
    }, 'Yearly report generated successfully');
  }
};

// Legacy compatibility exports (still used by routeController.js)
exports.assignDriverToRoute = async (req, res) => {
  const driver = found(await Driver.findById(id(req.body.driverId, 'driver ID')), 'Driver');
  if (!driver.assignedBus) fail(409, 'Assign the driver to a bus first.');
  return ok(res, await assignDriver(String(driver.assignedBus), String(driver._id), req.params.id), 'Driver assigned to route');
};

exports.allocateStudentToBus = async (req, res) => {
  const assignment = await allocate(req.body, req.user.id);
  return ok(res, assignment, 'Student assigned to transport', 201);
};
