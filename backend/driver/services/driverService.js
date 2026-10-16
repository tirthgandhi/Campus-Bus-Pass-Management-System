'use strict';

const mongoose = require('mongoose');
const Driver = require('../../database/models/Driver');
const Bus = require('../../database/models/Bus');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { fail, found, sameId, day, text } = require('../../common/utils/http');
const {
  validateRegistration,
  validateProfileUpdate,
  validateBusPass,
  validateAttendanceInput,
  validateObjectId,
  validatePagination,
} = require('../validations/driverValidation');

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTodayDateRange() {
  const todayDate = day();
  const startOfDay = new Date(todayDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(todayDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return { todayDate, startOfDay, endOfDay };
}

async function findDriverBus(driverId, driverDoc) {
  let bus = await Bus.findOne({ assignedDriver: driverId });
  if (!bus && driverDoc?.assignedBus) {
    bus = await Bus.findById(driverDoc.assignedBus);
  }
  return bus;
}

async function findDriverRoute(driverId, driverDoc, bus) {
  let route = await Route.findOne({ assignedDriver: driverId }).populate('pickupPoints');
  if (!route && bus) {
    route = await Route.findOne({ assignedBus: bus._id }).populate('pickupPoints');
  }
  if (!route && driverDoc?.assignedRoute) {
    route = await Route.findById(driverDoc.assignedRoute).populate('pickupPoints');
  }
  return route;
}

async function registerDriver(body) {
  const validated = validateRegistration(body);

  const existingEmail = await Driver.findOne({ email: validated.email });
  if (existingEmail) {
    fail(409, 'A driver with this email already exists.');
  }

  const existingLicense = await Driver.findOne({ licenseNumber: validated.licenseNumber });
  if (existingLicense) {
    fail(409, 'A driver with this license number already exists.');
  }

  const driver = new Driver({
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    licenseNumber: validated.licenseNumber,
    password: validated.password,
    status: 'active',
    isVerified: true,
  });

  await driver.save();

  return {
    _id: driver._id,
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    licenseNumber: driver.licenseNumber,
    status: driver.status,
    isVerified: driver.isVerified,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
}

async function getDriverProfile(driverAccount) {
  const driver = await Driver.findById(driverAccount._id)
    .select('-password -emailVerificationToken -emailVerificationExpires')
    .populate('assignedBus', 'busNumber registrationNumber capacity busType status')
    .populate('assignedRoute', 'routeName routeCode startPoint endPoint timings status');

  if (!driver) {
    fail(404, 'Driver profile not found.');
  }

  return driver;
}

async function updateDriverProfile(driverAccount, body) {
  const updates = validateProfileUpdate(body);

  const driver = await Driver.findById(driverAccount._id);
  if (!driver) {
    fail(404, 'Driver profile not found.');
  }

  if (updates.email && updates.email !== driver.email) {
    const existing = await Driver.findOne({ email: updates.email, _id: { $ne: driver._id } });
    if (existing) {
      fail(409, 'A driver with this email already exists.');
    }
    driver.email = updates.email;
  }

  if (updates.name) driver.name = updates.name;
  if (updates.phone) driver.phone = updates.phone;

  await driver.save();

  return Driver.findById(driver._id)
    .select('-password -emailVerificationToken -emailVerificationExpires')
    .populate('assignedBus', 'busNumber registrationNumber capacity busType status')
    .populate('assignedRoute', 'routeName routeCode startPoint endPoint timings status');
}

async function getAssignedBus(driverId, driverDoc) {
  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    fail(404, 'No bus assigned');
  }
  return {
    _id: bus._id,
    busNumber: bus.busNumber,
    registrationNumber: bus.registrationNumber,
    capacity: bus.capacity,
    busType: bus.busType,
    status: bus.status,
  };
}

async function getAssignedRoute(driverId, driverDoc) {
  const bus = await findDriverBus(driverId, driverDoc);
  const route = await findDriverRoute(driverId, driverDoc, bus);
  if (!route) {
    fail(404, 'No route assigned');
  }

  let pickupPoints = [];
  if (route.pickupPoints && route.pickupPoints.length > 0) {
    pickupPoints = await PickupPoint.find({ _id: { $in: route.pickupPoints }, status: 'active' }).sort({ sequence: 1 });
  } else {
    pickupPoints = await PickupPoint.find({ route: route._id, status: 'active' }).sort({ sequence: 1 });
  }

  return {
    _id: route._id,
    routeName: route.routeName,
    routeCode: route.routeCode,
    description: route.description,
    startPoint: route.startPoint,
    endPoint: route.endPoint,
    timings: route.timings,
    status: route.status,
    pickupPoints,
  };
}

async function getDriverPickupPoints(driverId, driverDoc) {
  const bus = await findDriverBus(driverId, driverDoc);
  const route = await findDriverRoute(driverId, driverDoc, bus);
  if (!route) {
    fail(404, 'No route assigned');
  }

  return PickupPoint.find({ route: route._id, status: 'active' }).sort({ sequence: 1 });
}

async function getAssignedStudents(driverId, driverDoc, query) {
  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    return [];
  }

  const { page, limit, search } = validatePagination(query);

  const assignments = await BusAssignment.find({ bus: bus._id, status: 'active' })
    .populate('student', 'name studentId collegeEmail department transportStatus')
    .populate('route', 'routeName routeCode startPoint endPoint timings')
    .populate('pickupPoint', 'name location landmark pickupTime sequence');

  let filtered = assignments.filter(a => Boolean(a.student));

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filtered = filtered.filter(a => {
      const studentName = a.student?.name || '';
      const studentId = a.student?.studentId || '';
      const passId = a.busPassId || '';
      return regex.test(studentName) || regex.test(studentId) || regex.test(passId);
    });
  }

  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return paginated.map(a => ({
    _id: a._id,
    busPassId: a.busPassId,
    status: a.status,
    student: {
      _id: a.student._id,
      name: a.student.name,
      studentId: a.student.studentId,
      enrollmentNumber: a.student.studentId,
      department: a.student.department,
      transportStatus: a.student.transportStatus,
    },
    bus: {
      _id: bus._id,
      busNumber: bus.busNumber,
    },
    route: a.route ? {
      _id: a.route._id,
      routeName: a.route.routeName,
      routeCode: a.route.routeCode,
    } : null,
    pickupPoint: a.pickupPoint ? {
      _id: a.pickupPoint._id,
      name: a.pickupPoint.name,
      pickupTime: a.pickupPoint.pickupTime,
    } : null,
  }));
}

async function verifyBusPass(driverId, driverDoc, busPassId) {
  validateBusPass({ busPassId });

  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    fail(404, 'No active bus pass was found for your assigned bus and route.');
  }

  const assignment = await BusAssignment.findOne({ busPassId: busPassId.trim(), status: 'active' })
    .populate('student', 'name studentId department collegeEmail transportStatus')
    .populate('bus', 'busNumber registrationNumber capacity status assignedDriver')
    .populate('route', 'routeName routeCode status assignedDriver')
    .populate('pickupPoint', 'name location pickupTime');

  if (!assignment) {
    const inactive = await BusAssignment.findOne({ busPassId: busPassId.trim() });
    if (inactive && inactive.status !== 'active') {
      fail(400, 'Bus pass assignment is inactive');
    }
    fail(404, 'Bus pass not found');
  }

  if (!sameId(assignment.bus, bus._id)) {
    fail(403, 'Student is not assigned to your bus');
  }

  if (!assignment.student || assignment.student.transportStatus !== 'approved') {
    fail(400, 'Student transport request is not approved');
  }

  return {
    student: {
      _id: assignment.student._id,
      name: assignment.student.name,
      enrollmentNumber: assignment.student.studentId,
      studentId: assignment.student.studentId,
      department: assignment.student.department,
      transportStatus: assignment.student.transportStatus,
    },
    busPassId: assignment.busPassId,
    bus: {
      _id: assignment.bus._id,
      busNumber: assignment.bus.busNumber,
      registrationNumber: assignment.bus.registrationNumber,
    },
    route: assignment.route ? {
      _id: assignment.route._id,
      routeName: assignment.route.routeName,
      routeCode: assignment.route.routeCode,
    } : null,
    pickupPoint: assignment.pickupPoint ? {
      _id: assignment.pickupPoint._id,
      name: assignment.pickupPoint.name,
    } : null,
  };
}

async function markAttendance(driverId, driverDoc, body) {
  const { busPassId, studentId, status } = validateAttendanceInput(body);

  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    fail(403, 'No bus assigned to this driver');
  }

  let assignment = null;
  if (busPassId) {
    assignment = await BusAssignment.findOne({ busPassId, status: 'active' })
      .populate('student', 'name studentId department transportStatus')
      .populate('bus', 'busNumber registrationNumber')
      .populate('route', 'routeName routeCode')
      .populate('pickupPoint', 'name location');

    if (!assignment) {
      const inactive = await BusAssignment.findOne({ busPassId });
      if (inactive && inactive.status !== 'active') {
        fail(400, 'Bus pass assignment is inactive');
      }
      fail(404, 'Bus pass not found');
    }
  } else if (studentId) {
    validateObjectId(studentId, 'student ID');
    assignment = await BusAssignment.findOne({ student: studentId, status: 'active' })
      .populate('student', 'name studentId department transportStatus')
      .populate('bus', 'busNumber registrationNumber')
      .populate('route', 'routeName routeCode')
      .populate('pickupPoint', 'name location');

    if (!assignment) {
      fail(404, 'No active bus assignment found for this student');
    }
  }

  if (!sameId(assignment.bus, bus._id)) {
    fail(403, 'Student is not assigned to your bus');
  }

  const { todayDate, startOfDay, endOfDay } = getTodayDateRange();

  if (body.date && day(body.date).getTime() !== todayDate.getTime()) {
    fail(400, 'Attendance can only be marked for today.');
  }

  const existing = await Attendance.findOne({
    student: assignment.student._id,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (existing) {
    fail(409, 'Attendance already marked for this student today');
  }

  const attendance = await Attendance.create({
    student: assignment.student._id,
    driver: driverId,
    bus: assignment.bus._id,
    route: assignment.route._id,
    pickupPoint: assignment.pickupPoint._id,
    busPassId: assignment.busPassId,
    date: todayDate,
    status,
    boardingTime: status === 'present' ? new Date() : null,
    markedAt: new Date(),
  });

  return Attendance.findById(attendance._id)
    .populate('student', 'name studentId department')
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .populate('pickupPoint', 'name');
}

async function getTodayAttendance(driverId) {
  const { startOfDay, endOfDay } = getTodayDateRange();

  return Attendance.find({
    driver: driverId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate('student', 'name studentId department')
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .populate('pickupPoint', 'name')
    .sort({ markedAt: -1 });
}

async function getAttendanceHistory(driverId, query = {}) {
  const filter = { driver: driverId };

  if (query.date) {
    const targetDate = day(query.date);
    const start = new Date(targetDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  } else if (query.month || query.year) {
    const year = parseInt(query.year, 10) || new Date().getFullYear();
    if (query.month) {
      const month = parseInt(query.month, 10) - 1;
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    } else {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
  }

  if (query.status && ['present', 'absent'].includes(query.status.toLowerCase())) {
    filter.status = query.status.toLowerCase();
  }

  if (query.student) {
    validateObjectId(query.student, 'student ID');
    filter.student = query.student;
  }

  const { page, limit } = validatePagination(query);
  const skip = (page - 1) * limit;

  return Attendance.find(filter)
    .populate('student', 'name studentId department')
    .populate('bus', 'busNumber registrationNumber')
    .populate('route', 'routeName routeCode')
    .populate('pickupPoint', 'name')
    .sort({ date: -1, markedAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function getDriverDashboard(driverId, driverDoc) {
  const bus = await findDriverBus(driverId, driverDoc);
  const route = await findDriverRoute(driverId, driverDoc, bus);

  const assignedStudents = bus && route
    ? await BusAssignment.countDocuments({ bus: bus._id, route: route._id, status: 'active' })
    : (bus ? await BusAssignment.countDocuments({ bus: bus._id, status: 'active' }) : 0);

  const { startOfDay, endOfDay } = getTodayDateRange();
  const todayAttendance = await Attendance.countDocuments({
    driver: driverId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'present',
  });

  return {
    driver: driverDoc,
    bus,
    route,
    assignedStudents,
    todayAttendance,
  };
}

async function reportProblem(driverId, driverDoc, body) {
  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    fail(409, 'You need an assigned bus to report a problem.');
  }

  const problemType = text(body.problemType, 'Problem type', { max: 40 });
  const severity = text(body.severity, 'Severity', { max: 20 });
  if (!['Engine Problem', 'Brake Problem', 'Tyre Problem', 'Electrical Problem', 'Fuel Problem', 'Other'].includes(problemType)) {
    fail(400, 'Choose a valid problem type.');
  }
  if (!['Low', 'Medium', 'High', 'Critical'].includes(severity)) {
    fail(400, 'Choose a valid severity.');
  }

  bus.problemReports.push({
    driver: driverId,
    problemType,
    severity,
    description: text(body.description, 'Description', { max: 1000 }),
  });

  await bus.save();
  return bus.problemReports[bus.problemReports.length - 1];
}

async function getMyProblems(driverId, driverDoc) {
  const bus = await findDriverBus(driverId, driverDoc);
  if (!bus) {
    return [];
  }

  return bus.problemReports
    .filter(problem => sameId(problem.driver, driverId))
    .sort((a, b) => b.reportedAt - a.reportedAt);
}

module.exports = {
  findDriverBus,
  findDriverRoute,
  registerDriver,
  getDriverProfile,
  updateDriverProfile,
  getAssignedBus,
  getAssignedRoute,
  getDriverPickupPoints,
  getAssignedStudents,
  verifyBusPass,
  markAttendance,
  getTodayAttendance,
  getAttendanceHistory,
  getDriverDashboard,
  reportProblem,
  getMyProblems,
};
