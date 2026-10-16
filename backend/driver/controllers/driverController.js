'use strict';

const driverService = require('../services/driverService');
const { ok } = require('../../common/utils/http');

exports.registerDriver = async (req, res) => {
  const result = await driverService.registerDriver(req.body);
  return ok(res, result, 'Driver registered successfully', 201);
};

exports.getProfile = async (req, res) => {
  const result = await driverService.getDriverProfile(req.account);
  return ok(res, result, 'Driver profile fetched successfully');
};

exports.updateProfile = async (req, res) => {
  const result = await driverService.updateDriverProfile(req.account, req.body);
  return ok(res, result, 'Profile updated successfully');
};

exports.getAssignedBus = async (req, res) => {
  const bus = await driverService.getAssignedBus(req.user.id, req.account);
  return ok(res, bus, 'Assigned bus fetched successfully');
};

exports.getAssignedRoute = async (req, res) => {
  const route = await driverService.getAssignedRoute(req.user.id, req.account);
  return ok(res, route, 'Assigned route fetched successfully');
};

exports.getPickupPoints = async (req, res) => {
  const points = await driverService.getDriverPickupPoints(req.user.id, req.account);
  return ok(res, points, 'Pickup points fetched successfully');
};

exports.getAssignedStudents = async (req, res) => {
  const students = await driverService.getAssignedStudents(req.user.id, req.account, req.query);
  return ok(res, students, 'Assigned students fetched successfully');
};

exports.verifyBusPass = async (req, res) => {
  const result = await driverService.verifyBusPass(req.user.id, req.account, req.body.busPassId);
  return ok(res, result, 'Bus pass verified successfully');
};

exports.markAttendance = async (req, res) => {
  const attendance = await driverService.markAttendance(req.user.id, req.account, req.body);
  return ok(res, attendance, 'Attendance marked successfully', 201);
};

exports.getTodayAttendance = async (req, res) => {
  const records = await driverService.getTodayAttendance(req.user.id);
  return ok(res, records, "Today's attendance fetched successfully");
};

exports.getAttendanceHistory = async (req, res) => {
  const records = await driverService.getAttendanceHistory(req.user.id, req.query);
  return ok(res, records, 'Attendance history fetched successfully');
};

exports.getDriverDashboard = async (req, res) => {
  const dashboard = await driverService.getDriverDashboard(req.user.id, req.account);
  return ok(res, dashboard, 'Dashboard fetched successfully');
};

exports.reportProblem = async (req, res) => {
  const problem = await driverService.reportProblem(req.user.id, req.account, req.body);
  return ok(res, problem, 'Problem reported successfully', 201);
};

exports.getMyProblems = async (req, res) => {
  const problems = await driverService.getMyProblems(req.user.id, req.account);
  return ok(res, problems, 'Driver problems fetched successfully');
};
