const Bus = require('../../database/models/Bus');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { ok, fail, text, day, sameId, found } = require('../../common/utils/http');
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
  const busPassId = text(value, 'Bus Pass ID', { max: 100 });
  const assignment = await BusAssignment.findOne({ busPassId, status: 'active', bus: driver.assignedBus, route: driver.assignedRoute }).populate('student bus route pickupPoint');
  if (!assignment) fail(404, 'No active bus pass was found for your assigned bus and route.');
  if (!assignment.student || assignment.student.transportStatus !== 'approved' || assignment.bus?.status !== 'active' || assignment.route?.status !== 'active') fail(409, 'This transport assignment is not available.');
  if (!sameId(assignment.bus.assignedDriver, driver) || !sameId(assignment.route.assignedDriver, driver)) fail(403, 'This transport assignment is not available to you.');
  return assignment;
}
exports.getProfile = (req, res) => ok(res, req.account);
exports.getDriverDashboard = async (req, res) => {
  const driver = req.account;
  const bus = driver.assignedBus ? await assignedBus(driver) : null;
  const route = driver.assignedRoute ? await assignedRoute(driver) : null;
  const students = bus && route ? await BusAssignment.countDocuments({ bus: bus._id, route: route._id, status: 'active' }) : 0;
  const todayAttendance = await Attendance.countDocuments({ driver: driver._id, date: day() });
  return ok(res, { driver, bus, route, assignedStudents: students, todayAttendance });
};
exports.getAssignedBus = async (req, res) => ok(res, req.account.assignedBus ? await assignedBus(req.account) : null);
exports.getAssignedRoute = async (req, res) => ok(res, req.account.assignedRoute ? await assignedRoute(req.account) : null);
exports.getAssignedRoutePickupPoints = async (req, res) => {
  if (!req.account.assignedRoute) return ok(res, []);
  await assignedRoute(req.account);
  return ok(res, await PickupPoint.find({ route: req.account.assignedRoute, status: 'active' }).sort({ sequence: 1 }));
};
exports.getAssignedStudents = async (req, res) => {
  if (!req.account.assignedBus || !req.account.assignedRoute) return ok(res, []);
  await assignedBus(req.account); await assignedRoute(req.account);
  return ok(res, await BusAssignment.find({ bus: req.account.assignedBus, route: req.account.assignedRoute, status: 'active' }).populate('student pickupPoint'));
};
exports.verifyBusPassId = async (req, res) => ok(res, await verify(req.account, req.body.busPassId), 'Bus pass verified');
exports.markAttendance = async (req, res) => {
  const assignment = await verify(req.account, req.body.busPassId);
  const date = day();
  if (req.body.date && day(req.body.date).getTime() !== date.getTime()) fail(400, 'Attendance can only be marked for today.');
  const status = req.body.status || 'present';
  if (!['present', 'absent'].includes(status)) fail(400, 'Choose present or absent.');
  if (await Attendance.exists({ student: assignment.student._id, date })) fail(409, 'Attendance has already been recorded for this student today.');
  const attendance = await Attendance.create({ student: assignment.student._id, driver: req.user.id, bus: assignment.bus._id, route: assignment.route._id, pickupPoint: assignment.pickupPoint._id, busPassId: assignment.busPassId, date, status, boardingTime: status === 'present' ? new Date() : null });
  return ok(res, attendance, 'Attendance recorded', 201);
};
exports.getTodayAttendance = async (req, res) => ok(res, await Attendance.find({ driver: req.user.id, date: day() }).populate('student bus route').sort({ markedAt: -1 }));
