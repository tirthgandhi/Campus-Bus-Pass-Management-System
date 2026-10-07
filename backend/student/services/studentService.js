const Student = require('../../database/models/Student');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { fail, found } = require('../../common/utils/http');
const { profileChanges, pickupPointId } = require('../validations/studentValidation');
exports.updateProfile = async (account, body) => {
  const changes = profileChanges(body);
  Object.assign(account, changes);
  await account.save();
  return account;
};
exports.getPickupPoints = async () => {
  const activeRoutes = await Route.find({ status: 'active' }).select('_id');
  return await PickupPoint.find({ status: 'active', route: { $in: activeRoutes.map(route => route._id) } }).populate('route').sort({ route: 1, sequence: 1 });
};
exports.applyForPass = async (studentId, body) => {
  const pickupId = pickupPointId(body);
  const pickup = found(await PickupPoint.findById(pickupId).populate('route'), 'Pickup point');
  if (pickup.status !== 'active' || pickup.route?.status !== 'active') fail(409, 'Pickup point or route is inactive.');
  if (await BusAssignment.exists({ student: studentId, status: 'active' })) fail(409, 'You already have an active transport assignment.');
  if (await TransportRequest.exists({ student: studentId, status: { $in: ['pending', 'approved'] } })) fail(409, 'You already have a pending or approved transport request.');
  const request = await TransportRequest.create({ student: studentId, pickupPoint: pickupId, requestedRoute: pickup.route._id });
  await Student.updateOne({ _id: studentId }, { $set: { transportStatus: 'pending' } });
  return request;
};
exports.getMyPasses = async (studentId) => await TransportRequest.find({ student: studentId }).populate('pickupPoint requestedRoute').sort({ createdAt: -1 });
exports.getMyBusPass = async (studentId) => await BusAssignment.findOne({ student: studentId, status: 'active' }).populate('bus route pickupPoint');
exports.getAttendance = async (studentId) => await Attendance.find({ student: studentId }).populate('bus route').sort({ date: -1 });
