const express = require("express");
const { protect, authorize } = require("../common/middleware/authMiddleware");

const {
  getDriverDashboard,
  getAssignedBus,
  getAssignedRoute,
  getAssignedRoutePickupPoints,
  getAssignedStudents,
  verifyBusPassId,
  markAttendance,
  getTodayAttendance,
  reportBusProblem,
  getMyBusProblems,
} = require("./controllers/driverController");

const router = express.Router();

router.get("/dashboard", protect, authorize("driver"), getDriverDashboard);
router.get("/bus", protect, authorize("driver"), getAssignedBus);
router.get("/route", protect, authorize("driver"), getAssignedRoute);
router.get("/route/pickup-points", protect, authorize("driver"), getAssignedRoutePickupPoints);
router.get("/students", protect, authorize("driver"), getAssignedStudents);
router.post("/verify-bus-pass", protect, authorize("driver"), verifyBusPassId);
router.post("/attendance", protect, authorize("driver"), markAttendance);
router.get("/attendance/today", protect, authorize("driver"), getTodayAttendance);
router.post("/bus-problems", protect, authorize("driver"), reportBusProblem);
router.get("/bus-problems", protect, authorize("driver"), getMyBusProblems);

module.exports = router;
