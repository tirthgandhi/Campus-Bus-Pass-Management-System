const mongoose = require('mongoose');
const Bus = require('../../database/models/Bus');
const Driver = require('../../database/models/Driver');
const Student = require('../../database/models/Student');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { allocate, assignDriver } = require('../../common/services/assignments');
const { ok, fail, found, id, pick, text, sameId, day } = require('../../common/utils/http');
const { phone } = require('../../common/services/accounts');
const busFields = ['busNumber', 'registrationNumber', 'capacity', 'busType', 'status'];
const routeFields = ['routeName', 'routeCode', 'description', 'startPoint', 'endPoint', 'status', 'timings'];
const pickupFields = ['name', 'location', 'landmark', 'route', 'sequence', 'status', 'pickupTime'];

exports.createBus = async (req, res) => ok(res, await Bus.create(pick(req.body, busFields)), 'Bus created', 201);
exports.getBuses = async (req, res) => ok(res, await Bus.find().populate('assignedDriver').sort({ createdAt: -1 }));
exports.getBusById = async (req, res) => ok(res, found(await Bus.findById(req.params.id).populate('assignedDriver'), 'Bus'));
exports.updateBus = async (req, res) => {
  const bus = await mongoose.connection.transaction(async session => {
    const record = found(await Bus.findById(req.params.id).session(session), 'Bus');
    const changes = pick(req.body, busFields);
    if (changes.capacity !== undefined && Number(changes.capacity) < await BusAssignment.countDocuments({ bus: record._id, status: 'active' }).session(session)) fail(409, 'Capacity cannot be lower than the number of assigned students.');
    Object.assign(record, changes);
    await record.save({ session });
    return record;
  });
  return ok(res, bus, 'Bus updated');
};
exports.deleteBus = async (req, res) => {
  const bus = found(await Bus.findById(req.params.id), 'Bus');
  if (await BusAssignment.exists({ bus: bus._id }) || await Attendance.exists({ bus: bus._id }) || await Driver.exists({ assignedBus: bus._id }) || await Route.exists({ assignedBus: bus._id })) fail(409, 'This bus is referenced by transportation records. Mark it inactive instead.');
  await bus.deleteOne();
  return ok(res, {}, 'Bus deleted');
};
exports.createRoute = async (req, res) => {
  const data = pick(req.body, routeFields);
  if (req.body.assignedBus) { const busId = id(req.body.assignedBus, 'bus ID'); found(await Bus.findById(busId), 'Bus'); data.assignedBus = busId; }
  return ok(res, await Route.create(data), 'Route created', 201);
};
exports.getRoutes = async (req, res) => ok(res, await Route.find().populate('pickupPoints assignedBus assignedDriver').sort({ createdAt: -1 }));
exports.getRouteById = async (req, res) => ok(res, found(await Route.findById(req.params.id).populate('pickupPoints assignedBus assignedDriver'), 'Route'));
exports.updateRoute = async (req, res) => {
  const route = found(await Route.findById(req.params.id), 'Route');
  if (req.body.assignedBus !== undefined) {
    const busId = id(req.body.assignedBus, 'bus ID');
    if (route.assignedBus && !sameId(route.assignedBus, busId)) fail(409, 'This route already has an assigned bus.');
    found(await Bus.findById(busId), 'Bus'); route.assignedBus = busId;
  }
  Object.assign(route, pick(req.body, routeFields));
  await route.save();
  return ok(res, route, 'Route updated');
};
exports.deleteRoute = async (req, res) => {
  const route = found(await Route.findById(req.params.id), 'Route');
  if (await PickupPoint.exists({ route: route._id }) || await TransportRequest.exists({ requestedRoute: route._id }) || await BusAssignment.exists({ route: route._id }) || await Attendance.exists({ route: route._id }) || await Driver.exists({ assignedRoute: route._id })) fail(409, 'This route is referenced by transportation records. Mark it inactive instead.');
  await route.deleteOne();
  return ok(res, {}, 'Route deleted');
};
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
exports.getPickupPoints = async (req, res) => ok(res, await PickupPoint.find().populate('route').sort({ route: 1, sequence: 1 }));
exports.getPickupPointById = async (req, res) => ok(res, found(await PickupPoint.findById(req.params.id).populate('route'), 'Pickup point'));
exports.updatePickupPoint = async (req, res) => {
  if (req.body.route !== undefined) id(req.body.route, 'route ID');
  const pickup = await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(req.params.id).session(session), 'Pickup point');
    const oldRoute = record.route;
    const changes = pick(req.body, pickupFields);
    if (changes.route && !sameId(oldRoute, changes.route)) {
      if (await TransportRequest.exists({ pickupPoint: record._id }).session(session) || await BusAssignment.exists({ pickupPoint: record._id }).session(session)) fail(409, 'A pickup point with transportation records cannot change route.');
      found(await Route.findById(changes.route).session(session), 'Route');
      await Route.updateOne({ _id: oldRoute }, { $pull: { pickupPoints: record._id } }, { session });
      await Route.updateOne({ _id: changes.route }, { $addToSet: { pickupPoints: record._id } }, { session });
    }
    Object.assign(record, changes); await record.save({ session }); return record;
  });
  return ok(res, pickup, 'Pickup point updated');
};
exports.deletePickupPoint = async (req, res) => {
  await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(req.params.id).session(session), 'Pickup point');
    if (await TransportRequest.exists({ pickupPoint: record._id }).session(session) || await BusAssignment.exists({ pickupPoint: record._id }).session(session) || await Attendance.exists({ pickupPoint: record._id }).session(session)) fail(409, 'This pickup point is referenced by transportation records. Mark it inactive instead.');
    await Route.updateOne({ _id: record.route }, { $pull: { pickupPoints: record._id } }, { session });
    await record.deleteOne({ session });
  });
  return ok(res, {}, 'Pickup point deleted');
};

async function listRequests(filter) { return TransportRequest.find(filter).populate('student pickupPoint requestedRoute reviewedBy').sort({ createdAt: -1 }); }
exports.getPendingTransportRequests = async (req, res) => ok(res, await listRequests({ status: 'pending' }));
exports.getTransportRequests = async (req, res) => {
  if (req.query.status && !['pending', 'approved', 'rejected'].includes(req.query.status)) fail(400, 'Invalid request status.');
  return ok(res, await listRequests(req.query.status ? { status: req.query.status } : {}));
};
async function review(req, res, status) {
  const rejectionReason = status === 'rejected' ? text(req.body.rejectionReason, 'Rejection reason', { max: 500 }) : null;
  const request = await mongoose.connection.transaction(async session => {
    const current = found(await TransportRequest.findById(req.params.id).session(session), 'Transport request');
    if (current.status !== 'pending') fail(409, 'This request has already been reviewed.');
    current.status = status; current.reviewedBy = req.user.id; current.reviewedAt = new Date(); current.rejectionReason = rejectionReason;
    await current.save({ session });
    const student = found(await Student.findById(current.student).session(session), 'Student');
    if (student.transportStatus === 'inactive') fail(409, 'Student account is inactive.');
    student.transportStatus = status; await student.save({ session });
    return current;
  });
  return ok(res, request, `Transport request ${status}`);
}
exports.approveTransportRequest = (req, res) => review(req, res, 'approved');
exports.rejectTransportRequest = (req, res) => review(req, res, 'rejected');
exports.allocateStudentToBus = async (req, res) => ok(res, await allocate(req.body, req.user.id), 'Student assigned to transport', 201);
exports.getAssignments = async (req, res) => ok(res, await BusAssignment.find().populate('student bus route pickupPoint assignedBy').sort({ assignedAt: -1 }));
exports.assignDriverToBus = async (req, res) => ok(res, await assignDriver(req.params.id, req.body.driverId, req.body.routeId), 'Driver assigned');
exports.assignDriverToRoute = async (req, res) => {
  const driver = found(await Driver.findById(id(req.body.driverId, 'driver ID')), 'Driver');
  if (!driver.assignedBus) fail(409, 'Assign the driver to a bus first.');
  return ok(res, await assignDriver(String(driver.assignedBus), String(driver._id), req.params.id), 'Driver assigned to route');
};
exports.getAttendance = async (req, res) => {
  const filter = req.query.date ? { date: day(req.query.date) } : {};
  return ok(res, await Attendance.find(filter).populate('student driver bus route pickupPoint').sort({ date: -1 }));
};
exports.getStudents = async (req, res) => ok(res, await Student.find().sort({ createdAt: -1 }));
exports.getDrivers = async (req, res) => ok(res, await Driver.find().populate('assignedBus assignedRoute').sort({ createdAt: -1 }));
async function updateAccount(req, res, Model, fields) {
  const record = found(await Model.findById(req.params.id), 'Account');
  const changes = pick(req.body, fields);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  Object.assign(record, changes); await record.save(); return ok(res, record, 'Account updated');
}
exports.updateStudent = (req, res) => updateAccount(req, res, Student, ['name', 'phone', 'department', 'semester']);
exports.updateDriver = (req, res) => updateAccount(req, res, Driver, ['name', 'phone', 'status']);
