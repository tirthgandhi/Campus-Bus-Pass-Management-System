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
const { fail, found, id, sameId, day } = require('../../common/utils/http');
const { busData, routeData, pickupData, requestFilter, rejectionReason: validateRejectionReason, accountChanges } = require('../validations/adminValidation');

exports.createBus = async (data) => await Bus.create(busData(data));
exports.getBuses = async () => await Bus.find().populate('assignedDriver').sort({ createdAt: -1 });
exports.getBusById = async (recordId) => found(await Bus.findById(recordId).populate('assignedDriver'), 'Bus');
exports.updateBus = async (recordId, data) => {
  const bus = await mongoose.connection.transaction(async session => {
    const record = found(await Bus.findById(recordId).session(session), 'Bus');
    const changes = busData(data);
    if (changes.capacity !== undefined && Number(changes.capacity) < await BusAssignment.countDocuments({ bus: record._id, status: 'active' }).session(session)) fail(409, 'Capacity cannot be lower than the number of assigned students.');
    Object.assign(record, changes);
    await record.save({ session });
    return record;
  });
  return bus;
};
exports.deleteBus = async (recordId) => {
  const bus = found(await Bus.findById(recordId), 'Bus');
  if (await BusAssignment.exists({ bus: bus._id }) || await Attendance.exists({ bus: bus._id }) || await Driver.exists({ assignedBus: bus._id }) || await Route.exists({ assignedBus: bus._id })) fail(409, 'This bus is referenced by transportation records. Mark it inactive instead.');
  await bus.deleteOne();
  return {};
};
exports.createRoute = async (data) => {
  const changes = routeData(data);
  if (data.assignedBus) { const busId = id(data.assignedBus, 'bus ID'); found(await Bus.findById(busId), 'Bus'); changes.assignedBus = busId; }
  return await Route.create(changes);
};
exports.getRoutes = async () => await Route.find().populate('pickupPoints assignedBus assignedDriver').sort({ createdAt: -1 });
exports.getRouteById = async (recordId) => found(await Route.findById(recordId).populate('pickupPoints assignedBus assignedDriver'), 'Route');
exports.updateRoute = async (recordId, data) => {
  const route = found(await Route.findById(recordId), 'Route');
  if (data.assignedBus !== undefined) {
    const busId = id(data.assignedBus, 'bus ID');
    if (route.assignedBus && !sameId(route.assignedBus, busId)) fail(409, 'This route already has an assigned bus.');
    found(await Bus.findById(busId), 'Bus'); route.assignedBus = busId;
  }
  Object.assign(route, routeData(data));
  await route.save();
  return route;
};
exports.deleteRoute = async (recordId) => {
  const route = found(await Route.findById(recordId), 'Route');
  if (await PickupPoint.exists({ route: route._id }) || await TransportRequest.exists({ requestedRoute: route._id }) || await BusAssignment.exists({ route: route._id }) || await Attendance.exists({ route: route._id }) || await Driver.exists({ assignedRoute: route._id })) fail(409, 'This route is referenced by transportation records. Mark it inactive instead.');
  await route.deleteOne();
  return {};
};
exports.createPickupPoint = async (data) => {
  id(data.route, 'route ID');
  const pickup = await mongoose.connection.transaction(async session => {
    found(await Route.findById(data.route).session(session), 'Route');
    const [record] = await PickupPoint.create([pickupData(data)], { session });
    await Route.updateOne({ _id: record.route }, { $addToSet: { pickupPoints: record._id } }, { session });
    return record;
  });
  return pickup;
};
exports.getPickupPoints = async () => await PickupPoint.find().populate('route').sort({ route: 1, sequence: 1 });
exports.getPickupPointById = async (recordId) => found(await PickupPoint.findById(recordId).populate('route'), 'Pickup point');
exports.updatePickupPoint = async (recordId, data) => {
  if (data.route !== undefined) id(data.route, 'route ID');
  const pickup = await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(recordId).session(session), 'Pickup point');
    const oldRoute = record.route;
    const changes = pickupData(data);
    if (changes.route && !sameId(oldRoute, changes.route)) {
      if (await TransportRequest.exists({ pickupPoint: record._id }).session(session) || await BusAssignment.exists({ pickupPoint: record._id }).session(session)) fail(409, 'A pickup point with transportation records cannot change route.');
      found(await Route.findById(changes.route).session(session), 'Route');
      await Route.updateOne({ _id: oldRoute }, { $pull: { pickupPoints: record._id } }, { session });
      await Route.updateOne({ _id: changes.route }, { $addToSet: { pickupPoints: record._id } }, { session });
    }
    Object.assign(record, changes); await record.save({ session }); return record;
  });
  return pickup;
};
exports.deletePickupPoint = async (recordId) => {
  await mongoose.connection.transaction(async session => {
    const record = found(await PickupPoint.findById(recordId).session(session), 'Pickup point');
    if (await TransportRequest.exists({ pickupPoint: record._id }).session(session) || await BusAssignment.exists({ pickupPoint: record._id }).session(session) || await Attendance.exists({ pickupPoint: record._id }).session(session)) fail(409, 'This pickup point is referenced by transportation records. Mark it inactive instead.');
    await Route.updateOne({ _id: record.route }, { $pull: { pickupPoints: record._id } }, { session });
    await record.deleteOne({ session });
  });
  return {};
};

async function listRequests(filter) { return TransportRequest.find(filter).populate('student pickupPoint requestedRoute reviewedBy').sort({ createdAt: -1 }); }
exports.getPendingTransportRequests = async () => await listRequests({ status: 'pending' });
exports.getTransportRequests = async (query) => {
  return await listRequests(requestFilter(query));
};
async function review(recordId, data, adminId, status) {
  const rejectionReason = validateRejectionReason(data, status);
  const request = await mongoose.connection.transaction(async session => {
    const current = found(await TransportRequest.findById(recordId).session(session), 'Transport request');
    if (current.status !== 'pending') fail(409, 'This request has already been reviewed.');
    current.status = status; current.reviewedBy = adminId; current.reviewedAt = new Date(); current.rejectionReason = rejectionReason;
    await current.save({ session });
    const student = found(await Student.findById(current.student).session(session), 'Student');
    if (student.transportStatus === 'inactive') fail(409, 'Student account is inactive.');
    student.transportStatus = status; await student.save({ session });
    return current;
  });
  return request;
}
exports.approveTransportRequest = (recordId, data, adminId) => review(recordId, data, adminId, 'approved');
exports.rejectTransportRequest = (recordId, data, adminId) => review(recordId, data, adminId, 'rejected');
exports.allocateStudentToBus = async (data, adminId) => await allocate(data, adminId);
exports.getAssignments = async () => await BusAssignment.find().populate('student bus route pickupPoint assignedBy').sort({ assignedAt: -1 });
exports.assignDriverToBus = async (recordId, data) => await assignDriver(recordId, data.driverId, data.routeId);
exports.assignDriverToRoute = async (recordId, data) => {
  const driver = found(await Driver.findById(id(data.driverId, 'driver ID')), 'Driver');
  if (!driver.assignedBus) fail(409, 'Assign the driver to a bus first.');
  return await assignDriver(String(driver.assignedBus), String(driver._id), recordId);
};
exports.getAttendance = async (query) => {
  const filter = query.date ? { date: day(query.date) } : {};
  return await Attendance.find(filter).populate('student driver bus route pickupPoint').sort({ date: -1 });
};
exports.getStudents = async () => await Student.find().sort({ createdAt: -1 });
exports.getDrivers = async () => await Driver.find().populate('assignedBus assignedRoute').sort({ createdAt: -1 });
async function updateAccount(recordId, data, Model, fields) {
  const record = found(await Model.findById(recordId), 'Account');
  const changes = accountChanges(data, fields);
  Object.assign(record, changes); await record.save(); return record;
}
exports.updateStudent = (recordId, data) => updateAccount(recordId, data, Student, ['name', 'phone', 'department', 'semester']);
exports.updateDriver = (recordId, data) => updateAccount(recordId, data, Driver, ['name', 'phone', 'status']);
