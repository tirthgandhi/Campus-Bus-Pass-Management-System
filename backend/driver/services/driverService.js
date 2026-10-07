const Bus = require('../../database/models/Bus');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { fail, day, sameId, found } = require('../../common/utils/http');
const { busPassId: validateBusPassId, attendanceDetails } = require('../validations/driverValidation');

async function assignedBus(driver) {
  const bus = found(await Bus.findById(driver.assignedBus), 'Assigned bus');
  if (!sameId(bus.assignedDriver, driver)) fail(403, 'Bus is not assigned to this driver.');
  return bus;
}
async function assignedRoute(driver) {
  const route = found(await Route.findById(driver.assignedRoute).populate('pickupPoints'), 'Assigned route');
  if (!sameId(route.assignedDriver, driver) || !sameId(route.assignedBus, driver.assignedBus)) fail(403, 'Route is not assigned to this driver and bus.');
  return route;
}
async function verify(driver, value) {
  const busPassId = validateBusPassId(value);
  const assignment = await BusAssignment.findOne({ busPassId, status: 'active', bus: driver.assignedBus, route: driver.assignedRoute }).populate('student bus route pickupPoint');
  if (!assignment) fail(404, 'No active bus pass was found for your assigned bus and route.');
  if (!assignment.student || assignment.student.transportStatus !== 'approved' || assignment.bus?.status !== 'active' || assignment.route?.status !== 'active') fail(409, 'This transport assignment is not available.');
  if (!sameId(assignment.bus.assignedDriver, driver) || !sameId(assignment.route.assignedDriver, driver)) fail(403, 'This transport assignment is not available to you.');
  return assignment;
}
exports.getDriverDashboard = async (driver) => {
  const bus = driver.assignedBus ? await assignedBus(driver) : null;
  const route = driver.assignedRoute ? await assignedRoute(driver) : null;
  const students = bus && route ? await BusAssignment.countDocuments({ bus: bus._id, route: route._id, status: 'active' }) : 0;
  const todayAttendance = await Attendance.countDocuments({ driver: driver._id, date: day() });
  return { driver, bus, route, assignedStudents: students, todayAttendance };
};
exports.getAssignedBus = async (driver) => driver.assignedBus ? await assignedBus(driver) : null;
exports.getAssignedRoute = async (driver) => driver.assignedRoute ? await assignedRoute(driver) : null;
exports.getAssignedRoutePickupPoints = async (driver) => {
  if (!driver.assignedRoute) return [];
  await assignedRoute(driver);
  return await PickupPoint.find({ route: driver.assignedRoute, status: 'active' }).sort({ sequence: 1 });
};
exports.getAssignedStudents = async (driver) => {
  if (!driver.assignedBus || !driver.assignedRoute) return [];
  await assignedBus(driver); await assignedRoute(driver);
  return await BusAssignment.find({ bus: driver.assignedBus, route: driver.assignedRoute, status: 'active' }).populate('student pickupPoint');
};
exports.verifyBusPassId = async (driver, body) => await verify(driver, body.busPassId);
exports.markAttendance = async (driver, body) => {
  const assignment = await verify(driver, body.busPassId);
  const { date, status } = attendanceDetails(body);
  if (await Attendance.exists({ student: assignment.student._id, date })) fail(409, 'Attendance has already been recorded for this student today.');
  const attendance = await Attendance.create({ student: assignment.student._id, driver: driver._id, bus: assignment.bus._id, route: assignment.route._id, pickupPoint: assignment.pickupPoint._id, busPassId: assignment.busPassId, date, status, boardingTime: status === 'present' ? new Date() : null });
  return attendance;
};
exports.getTodayAttendance = async (driver) => await Attendance.find({ driver: driver._id, date: day() }).populate('student bus route').sort({ markedAt: -1 });
