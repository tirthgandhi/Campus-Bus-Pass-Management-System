const express = require("express");

const {
    getMyBusPassengers,
    markAttendance,
    getTodayAttendance
} = require("../controllers/driverController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/my-bus/passengers",
    protect,
    authorize("driver"),
    getMyBusPassengers
);
router.post(
    "/attendance",
    protect,
    authorize("driver"),
    markAttendance
);
router.get(
    "/attendance/today",
    protect,
    authorize("driver"),
    getTodayAttendance
);

module.exports = router;