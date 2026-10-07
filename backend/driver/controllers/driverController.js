const service = require('../services/driverService');
const { ok } = require('../../common/utils/http');

exports.getProfile = (req, res) => ok(res, req.account);
exports.getDriverDashboard = async (req, res) => ok(res, await service.getDriverDashboard(req.account));
exports.getAssignedBus = async (req, res) => ok(res, await service.getAssignedBus(req.account));
exports.getAssignedRoute = async (req, res) => ok(res, await service.getAssignedRoute(req.account));
exports.getAssignedRoutePickupPoints = async (req, res) => ok(res, await service.getAssignedRoutePickupPoints(req.account));
exports.getAssignedStudents = async (req, res) => ok(res, await service.getAssignedStudents(req.account));
exports.verifyBusPassId = async (req, res) => ok(res, await service.verifyBusPassId(req.account, req.body), 'Bus pass verified');
exports.markAttendance = async (req, res) => ok(res, await service.markAttendance(req.account, req.body), 'Attendance recorded', 201);
exports.getTodayAttendance = async (req, res) => ok(res, await service.getTodayAttendance(req.account));
