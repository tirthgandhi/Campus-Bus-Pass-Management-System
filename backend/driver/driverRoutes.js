const express = require("express");
const {
    protect,
    authorize
} = require("../common/middleware/authMiddleware");

const {
    getMyBusPassengers,
    markAttendance,
    getTodayAttendance
} = require("./controllers/driverController");

const router = express.Router();

// GET  /api/driver/my-bus/passengers  → view assigned route's pickup students
router.get(
    "/my-bus/passengers",
    protect,
    authorize("driver"),
    getMyBusPassengers
);

// POST /api/driver/attendance          → mark student attendance
router.post(
    "/attendance",
    protect,
    authorize("driver"),
    markAttendance
);

// GET  /api/driver/attendance/today    → view today's attendance
router.get(
    "/attendance/today",
    protect,
    authorize("driver"),
    getTodayAttendance
);

module.exports = router;
