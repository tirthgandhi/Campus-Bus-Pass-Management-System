const service = require('../services/studentService');
const { ok } = require('../../common/utils/http');

exports.getProfile = (req, res) => ok(res, req.account);
exports.updateProfile = async (req, res) => ok(res, await service.updateProfile(req.account, req.body), 'Profile updated');
exports.getPickupPoints = async (req, res) => ok(res, await service.getPickupPoints());
exports.applyForPass = async (req, res) => ok(res, await service.applyForPass(req.user.id, req.body), 'Transport request submitted', 201);
exports.getMyPasses = async (req, res) => ok(res, await service.getMyPasses(req.user.id));
exports.getMyBusPass = async (req, res) => ok(res, await service.getMyBusPass(req.user.id));
exports.getAttendance = async (req, res) => ok(res, await service.getAttendance(req.user.id));
