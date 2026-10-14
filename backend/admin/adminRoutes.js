const express = require('express');
const { protect, authorize } = require('../common/middleware/authMiddleware');
const { wrap, id } = require('../common/utils/http');
const controller = require('./controllers/adminController');
const router = express.Router();
router.use(protect, authorize('admin'));
router.param('id', (req, res, next, value) => { try { id(value); next(); } catch (error) { next(error); } });
for (const [path, singular, plural] of [['buses', 'Bus', 'Buses'], ['routes', 'Route', 'Routes'], ['pickup-points', 'PickupPoint', 'PickupPoints']]) {
  router.get(`/${path}`, wrap(controller[`get${plural}`]));
  router.post(`/${path}`, wrap(controller[`create${singular}`]));
  router.get(`/${path}/:id`, wrap(controller[`get${singular}ById`]));
  router.put(`/${path}/:id`, wrap(controller[`update${singular}`]));
  router.delete(`/${path}/:id`, wrap(controller[`delete${singular}`]));
}
router.get('/students', wrap(controller.getStudents));
router.put('/students/:id', wrap(controller.updateStudent));
router.get('/drivers', wrap(controller.getDrivers));
router.put('/drivers/:id', wrap(controller.updateDriver));
router.put('/buses/:id/driver', wrap(controller.assignDriverToBus));
router.put('/routes/:id/driver', wrap(controller.assignDriverToRoute));
router.get('/transport-requests', wrap(controller.getTransportRequests));
router.get('/transport-requests/pending', wrap(controller.getPendingTransportRequests));
router.put('/transport-requests/:id/approve', wrap(controller.approveTransportRequest));
router.put('/transport-requests/:id/reject', wrap(controller.rejectTransportRequest));
router.post('/students/allocate', wrap(controller.allocateStudentToBus));
router.get('/assignments', wrap(controller.getAssignments));
router.get('/attendance', wrap(controller.getAttendance));
module.exports = router;
