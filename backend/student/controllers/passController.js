const Student = require('../../database/models/Student');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const Attendance = require('../../database/models/Attendance');
const { ok, fail, found, id, pick, text } = require('../../common/utils/http');
const { phone } = require('../../common/services/accounts');
exports.getProfile = async (req, res) => ok(res, req.account);
exports.updateProfile = async (req, res) => {
  const changes = pick(req.body, ['name', 'phone', 'department', 'semester']);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.department !== undefined) changes.department = text(changes.department, 'Department');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  Object.assign(req.account, changes);
  await req.account.save();
  return ok(res, req.account, 'Profile updated');
};
exports.getPickupPoints = async (req, res) => {
  const activeRoutes = await Route.find({ status: 'active' }).select('_id');
  return ok(res, await PickupPoint.find({ status: 'active', route: { $in: activeRoutes.map(route => route._id) } }).populate('route').sort({ route: 1, sequence: 1 }));
};
exports.applyForPass = async (req, res) => {
  const pickupId = id(req.body.pickupPoint, 'pickup point ID');
  const pickup = found(await PickupPoint.findById(pickupId).populate('route'), 'Pickup point');
  if (pickup.status !== 'active' || pickup.route?.status !== 'active') fail(409, 'Pickup point or route is inactive.');
  if (await BusAssignment.exists({ student: req.user.id, status: 'active' })) fail(409, 'You already have an active transport assignment.');
  if (await TransportRequest.exists({ student: req.user.id, status: { $in: ['pending', 'approved'] } })) fail(409, 'You already have a pending or approved transport request.');
  const request = await TransportRequest.create({ student: req.user.id, pickupPoint: pickupId, requestedRoute: pickup.route._id });
  await Student.updateOne({ _id: req.user.id }, { $set: { transportStatus: 'pending' } });
  return ok(res, request, 'Transport request submitted', 201);
};
exports.getMyPasses = async (req, res) => ok(res, await TransportRequest.find({ student: req.user.id }).populate('pickupPoint requestedRoute').sort({ createdAt: -1 }));
exports.getMyBusPass = async (req, res) => ok(res, await BusAssignment.findOne({ student: req.user.id, status: 'active' }).populate('bus route pickupPoint'));
exports.getAttendance = async (req, res) => ok(res, await Attendance.find({ student: req.user.id }).populate('bus route').sort({ date: -1 }));
