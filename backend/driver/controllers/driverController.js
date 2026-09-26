const Driver = require("../../database/models/Driver");
const Bus = require("../../database/models/Bus");
const Route = require("../../database/models/Route");
const PickupPoint = require("../../database/models/PickupPoint");
const Student = require("../../database/models/Student");
const BusAssignment = require("../../database/models/BusAssignment");
const Attendance = require("../../database/models/Attendance");
const BusProblem = require("../../database/models/BusProblem");

const getDriverDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId }).populate("assignedBus").populate("assignedRoute");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json({
      driver,
      assignedBus: driver.assignedBus || null,
      assignedRoute: driver.assignedRoute || null,
    });
  } catch (error) {
    console.error("Get driver dashboard error:", error.message);
    return res.status(500).json({ message: "Server error while fetching driver dashboard" });
  }
};

const getAssignedBus = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId }).populate("assignedBus");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus) {
      return res.status(404).json({ message: "No bus assigned to this driver" });
    }

    return res.status(200).json({ bus: driver.assignedBus });
  } catch (error) {
    console.error("Get assigned bus error:", error.message);
    return res.status(500).json({ message: "Server error while fetching assigned bus" });
  }
};

const getAssignedRoute = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId }).populate("assignedRoute");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedRoute) {
      return res.status(404).json({ message: "No route assigned to this driver" });
    }

    return res.status(200).json({ route: driver.assignedRoute });
  } catch (error) {
    console.error("Get assigned route error:", error.message);
    return res.status(500).json({ message: "Server error while fetching assigned route" });
  }
};

const getAssignedRoutePickupPoints = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedRoute) {
      return res.status(404).json({ message: "No route assigned to this driver" });
    }

    const route = await Route.findById(driver.assignedRoute).populate("pickupPoints");

    if (!route) {
      return res.status(404).json({ message: "Assigned route not found" });
    }

    return res.status(200).json({
      route,
      pickupPoints: route.pickupPoints || [],
    });
  } catch (error) {
    console.error("Get route pickup points error:", error.message);
    return res.status(500).json({ message: "Server error while fetching route pickup points" });
  }
};

const getAssignedStudents = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus || !driver.assignedRoute) {
      return res.status(404).json({ message: "Bus and route not assigned to this driver" });
    }

    const assignments = await BusAssignment.find({
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      status: "active",
    })
      .populate("student")
      .populate("pickupPoint")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get assigned students error:", error.message);
    return res.status(500).json({ message: "Server error while fetching assigned students" });
  }
};

const verifyBusPassId = async (req, res) => {
  try {
    const { busPassId } = req.body;

    if (!busPassId || !busPassId.trim()) {
      return res.status(400).json({ message: "busPassId is required" });
    }

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus || !driver.assignedRoute) {
      return res.status(404).json({ message: "No bus or route assigned to this driver" });
    }

    const student = await Student.findOne({ busPassId: busPassId.trim() });

    if (!student) {
      return res.status(404).json({ message: "Invalid bus pass ID" });
    }

    const assignment = await BusAssignment.findOne({
      student: student._id,
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      status: "active",
    }).populate("student").populate("pickupPoint");

    if (!assignment) {
      return res.status(403).json({
        message: "This student is not assigned to your bus and route",
      });
    }

    return res.status(200).json({
      message: "Bus pass verified successfully",
      student,
      assignment,
    });
  } catch (error) {
    console.error("Verify bus pass error:", error.message);
    return res.status(500).json({ message: "Server error while verifying bus pass" });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { busPassId, status, date } = req.body;

    if (!busPassId || !busPassId.trim()) {
      return res.status(400).json({ message: "busPassId is required" });
    }

    if (!status || !["present", "absent"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus || !driver.assignedRoute) {
      return res.status(404).json({ message: "No bus or route assigned to this driver" });
    }

    const student = await Student.findOne({ busPassId: busPassId.trim() });

    if (!student) {
      return res.status(404).json({ message: "Invalid bus pass ID" });
    }

    const assignment = await BusAssignment.findOne({
      student: student._id,
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      status: "active",
    });

    if (!assignment) {
      return res.status(403).json({
        message: "This student is not assigned to your bus and route",
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const duplicateAttendance = await Attendance.findOne({
      student: student._id,
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      date: attendanceDate,
    });

    if (duplicateAttendance) {
      return res.status(409).json({
        message: "Attendance already recorded for this student on this date and trip",
      });
    }

    const attendance = await Attendance.create({
      student: student._id,
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      pickupPoint: assignment.pickupPoint,
      busPassId: busPassId.trim(),
      date: attendanceDate,
      boardingTime: status === "present" ? new Date() : null,
      markedBy: driver._id,
      status,
    });

    return res.status(201).json({
      message: `Student marked ${status}`,
      attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error.message);
    return res.status(500).json({ message: "Server error while marking attendance" });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus || !driver.assignedRoute) {
      return res.status(404).json({ message: "No bus or route assigned to this driver" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      bus: driver.assignedBus,
      route: driver.assignedRoute,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate("student")
      .populate("bus")
      .populate("route")
      .populate("pickupPoint")
      .populate("markedBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      date: today,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error.message);
    return res.status(500).json({ message: "Server error while fetching attendance" });
  }
};

const reportBusProblem = async (req, res) => {
  try {
    const { problemType, description } = req.body;

    if (!problemType || !description || !description.trim()) {
      return res.status(400).json({
        message: "problemType and description are required",
      });
    }

    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedBus || !driver.assignedRoute) {
      return res.status(404).json({ message: "No bus or route assigned to this driver" });
    }

    const validProblemTypes = ["breakdown", "engine", "tyre", "electrical", "other"];

    if (!validProblemTypes.includes(problemType)) {
      return res.status(400).json({ message: "Invalid problemType" });
    }

    const problem = await BusProblem.create({
      bus: driver.assignedBus,
      driver: driver._id,
      route: driver.assignedRoute,
      problemType,
      description: description.trim(),
      reportedAt: new Date(),
      status: "reported",
    });

    return res.status(201).json({
      message: "Bus problem reported successfully",
      problem,
    });
  } catch (error) {
    console.error("Report bus problem error:", error.message);
    return res.status(500).json({ message: "Server error while reporting bus problem" });
  }
};

const getMyBusProblems = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const problems = await BusProblem.find({ driver: driver._id })
      .populate("bus")
      .populate("route")
      .sort({ reportedAt: -1 });

    return res.status(200).json({
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Get bus problems error:", error.message);
    return res.status(500).json({ message: "Server error while fetching bus problems" });
  }
};

module.exports = {
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
};
