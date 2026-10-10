const express = require("express");
const router = express.Router();

const {
  loginDriver,
  getProfile,
  getDashboard,
  getAssignedBus,
  getAssignedRoute,
  getAssignedStudents,
  verifyPass,
  recordAttendance,
  getTodayAttendance,
  reportProblem,
  getMyProblems
} = require("./controllers/driverController");

const { protect, authorize } = require("../common/middleware/authMiddleware");

// Public route
router.post("/login", loginDriver);

// Protected routes
router.use(protect);
router.use(authorize("driver"));

router.get("/profile", getProfile);
router.get("/dashboard", getDashboard);
router.get("/assigned-bus", getAssignedBus);
router.get("/assigned-route", getAssignedRoute);
router.get("/students", getAssignedStudents);
router.post("/verify-pass", verifyPass);
router.post("/attendance", recordAttendance);
router.get("/attendance/today", getTodayAttendance);
router.post("/report-problem", reportProblem);
router.get("/problems", getMyProblems);

module.exports = router;