const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../database/models/User");
const Driver = require("../../database/models/Driver");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "8h" }
  );
};

// POST /api/driver/login
const loginDriver = async (req, res) => {
  try {
    const { email, password, driverId } = req.body;

    if ((!email && !driverId) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/driverId and password",
      });
    }

    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      const driverProfile = await Driver.findOne({
        driverId: driverId.toUpperCase().trim(),
      }).populate("user");

      if (!driverProfile || !driverProfile.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
      user = driverProfile.user;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a driver account.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const driverProfile = await Driver.findOne({ user: user._id })
      .populate("assignedBus", "busNumber capacity status")
      .populate("assignedRoute", "routeName routeNumber startPoint endPoint");

    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found. Contact Admin.",
      });
    }

    if (driverProfile.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your driver account is inactive.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      driver: {
        id: driverProfile._id,
        driverId: driverProfile.driverId,
        name: user.name,
        email: user.email,
        phone: driverProfile.phone,
        licenseNumber: driverProfile.licenseNumber,
        status: driverProfile.status,
        assignedBus: driverProfile.assignedBus,
        assignedRoute: driverProfile.assignedRoute,
      },
    });
  } catch (error) {
    console.error("Driver login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// GET /api/driver/profile
const getProfile = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id })
      .populate("user", "name email")
      .populate("assignedBus", "busNumber capacity status")
      .populate(
        "assignedRoute",
        "routeName routeNumber startPoint endPoint stops"
      );

    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    res.status(200).json({
      success: true,
      driver: {
        id: driverProfile._id,
        driverId: driverProfile.driverId,
        name: driverProfile.user.name,
        email: driverProfile.user.email,
        phone: driverProfile.phone,
        licenseNumber: driverProfile.licenseNumber,
        status: driverProfile.status,
        assignedBus: driverProfile.assignedBus,
        assignedRoute: driverProfile.assignedRoute,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/driver/dashboard
const getDashboard = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id })
      .populate("user", "name email")
      .populate("assignedBus", "busNumber capacity status")
      .populate("assignedRoute", "routeName routeNumber startPoint endPoint");

    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    if (!driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you. Contact Admin.",
      });
    }

    const BusPass = require("../../database/models/BusPass");
    const Attendance = require("../../database/models/Attendance");

    const busIdStr = driverProfile.assignedBus._id
      ? driverProfile.assignedBus._id.toString()
      : driverProfile.assignedBus.toString();

    const totalAssignedStudents = await BusPass.countDocuments({
      status: "active",
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const boardedToday = await Attendance.countDocuments({
      status: "present",
      date: { $gte: today, $lt: tomorrow },
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    });

    const remaining = Math.max(totalAssignedStudents - boardedToday, 0);
    const attendancePercentage =
      totalAssignedStudents > 0
        ? Math.round((boardedToday / totalAssignedStudents) * 100)
        : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        driverName: driverProfile.user.name,
        driverId: driverProfile.driverId,
        email: driverProfile.user.email,
        phone: driverProfile.phone,
        assignedBus: {
          busNumber: driverProfile.assignedBus.busNumber,
          capacity: driverProfile.assignedBus.capacity,
          status: driverProfile.assignedBus.status,
        },
        assignedRoute: driverProfile.assignedRoute
          ? {
              routeName: driverProfile.assignedRoute.routeName,
              routeNumber: driverProfile.assignedRoute.routeNumber,
              startPoint: driverProfile.assignedRoute.startPoint,
              endPoint: driverProfile.assignedRoute.endPoint,
            }
          : null,
        stats: {
          totalAssignedStudents,
          boardedToday,
          remaining,
          attendancePercentage,
        },
        busStatus: driverProfile.assignedBus.status,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while loading dashboard",
    });
  }
};

// GET /api/driver/assigned-bus
const getAssignedBus = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id }).populate(
      "assignedBus"
    );

    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(404).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    res.status(200).json({
      success: true,
      bus: driverProfile.assignedBus,
    });
  } catch (error) {
    console.error("Get assigned bus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/driver/assigned-route
const getAssignedRoute = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id }).populate(
      "assignedRoute"
    );

    if (!driverProfile || !driverProfile.assignedRoute) {
      return res.status(404).json({
        success: false,
        message: "No route assigned to you",
      });
    }

    res.status(200).json({
      success: true,
      route: driverProfile.assignedRoute,
    });
  } catch (error) {
    console.error("Get assigned route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/driver/students
const getAssignedStudents = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id });

    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    const BusPass = require("../../database/models/BusPass");
    const Attendance = require("../../database/models/Attendance");

    const busIdStr = driverProfile.assignedBus.toString();

    const busPasses = await BusPass.find({
      status: "active",
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    }).populate("student", "name email");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      status: "present",
      date: { $gte: today, $lt: tomorrow },
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    });

    const boardedStudentIds = todayAttendance.map((a) =>
      a.student.toString()
    );

    const students = busPasses.map((pass) => {
      const isBoarded = boardedStudentIds.includes(
        pass.student._id.toString()
      );
      return {
        studentId: pass.student._id,
        name: pass.student.name,
        email: pass.student.email,
        busPassId: pass.passNumber,
        status: isBoarded ? "Boarded" : "Pending",
      };
    });

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/driver/verify-pass
const verifyPass = async (req, res) => {
  try {
    const { passNumber } = req.body;

    if (!passNumber) {
      return res.status(400).json({
        success: false,
        message: "Bus Pass ID is required",
      });
    }

    const driverProfile = await Driver.findOne({ user: req.user.id });
    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    const BusPass = require("../../database/models/BusPass");
    const Attendance = require("../../database/models/Attendance");

    const busPass = await BusPass.findOne({
      passNumber: passNumber.trim().toUpperCase(),
    }).populate("student", "name email");

    if (!busPass) {
      return res.status(404).json({
        success: false,
        message: "Bus Pass ID not found",
      });
    }

    if (busPass.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Bus Pass is ${busPass.status}`,
      });
    }

    if (busPass.bus.toString() !== driverProfile.assignedBus.toString()) {
      return res.status(403).json({
        success: false,
        message: "This student is not assigned to your bus",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyBoarded = await Attendance.findOne({
      student: busPass.student._id,
      bus: driverProfile.assignedBus,
      date: { $gte: today, $lt: tomorrow },
      status: "present",
    });

    if (alreadyBoarded) {
      return res.status(409).json({
        success: false,
        message: "Student already boarded today",
        boardedAt: alreadyBoarded.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      message: "Student verified successfully",
      student: {
        id: busPass.student._id,
        name: busPass.student.name,
        email: busPass.student.email,
        busPassId: busPass.passNumber,
        status: "ELIGIBLE FOR BOARDING",
      },
    });
  } catch (error) {
    console.error("Verify pass error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

// POST /api/driver/attendance
const recordAttendance = async (req, res) => {
  try {
    const { passNumber } = req.body;

    if (!passNumber) {
      return res.status(400).json({
        success: false,
        message: "Bus Pass ID is required",
      });
    }

    const driverProfile = await Driver.findOne({ user: req.user.id });
    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    const BusPass = require("../../database/models/BusPass");
    const Attendance = require("../../database/models/Attendance");

    const busPass = await BusPass.findOne({
      passNumber: passNumber.trim().toUpperCase(),
      status: "active",
    }).populate("student", "name");

    if (!busPass) {
      return res.status(404).json({
        success: false,
        message: "Valid Bus Pass not found",
      });
    }

    if (busPass.bus.toString() !== driverProfile.assignedBus.toString()) {
      return res.status(403).json({
        success: false,
        message: "Student is not assigned to your bus",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyExists = await Attendance.findOne({
      student: busPass.student._id,
      bus: driverProfile.assignedBus,
      date: { $gte: today, $lt: tomorrow },
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Student already accepted for this trip",
      });
    }

    const attendance = await Attendance.create({
      student: busPass.student._id,
      bus: driverProfile.assignedBus,
      driver: req.user.id,
      date: new Date(),
      status: "present",
    });

    const boardedCount = await Attendance.countDocuments({
      bus: driverProfile.assignedBus,
      date: { $gte: today, $lt: tomorrow },
      status: "present",
    });

    res.status(201).json({
      success: true,
      message: "Student accepted. Attendance recorded.",
      attendance: {
        studentName: busPass.student.name,
        busPassId: busPass.passNumber,
        time: attendance.createdAt,
        boardedCount,
      },
    });
  } catch (error) {
    console.error("Record attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while recording attendance",
    });
  }
};

// GET /api/driver/attendance/today
const getTodayAttendance = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id });

    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    const BusPass = require("../../database/models/BusPass");
    const Attendance = require("../../database/models/Attendance");

    const busIdStr = driverProfile.assignedBus.toString();

    const busPasses = await BusPass.find({
      status: "active",
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    }).populate("student", "name email");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      status: "present",
      date: { $gte: today, $lt: tomorrow },
      $expr: { $eq: [{ $toString: "$bus" }, busIdStr] },
    });

    const boardedMap = {};
    todayAttendance.forEach((a) => {
      boardedMap[a.student.toString()] = a.createdAt;
    });

    const students = busPasses.map((pass) => {
      const studentId = pass.student._id.toString();
      const boardedAt = boardedMap[studentId];
      return {
        studentId: pass.student._id,
        name: pass.student.name,
        busPassId: pass.passNumber,
        status: boardedAt ? "Boarded" : "Pending",
        time: boardedAt || null,
      };
    });

    const boardedCount = students.filter((s) => s.status === "Boarded").length;
    const total = students.length;
    const remaining = total - boardedCount;
    const percentage =
      total > 0 ? Math.round((boardedCount / total) * 100) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalAssigned: total,
        boarded: boardedCount,
        remaining,
        attendancePercentage: percentage,
      },
      students,
    });
  } catch (error) {
    console.error("Get today attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/driver/report-problem
const reportProblem = async (req, res) => {
  try {
    const { problemType, description, severity } = req.body;

    if (!problemType || !description || !severity) {
      return res.status(400).json({
        success: false,
        message: "problemType, description and severity are required",
      });
    }

    const allowedTypes = [
      "Engine Problem",
      "Brake Problem",
      "Tyre Problem",
      "Electrical Problem",
      "Fuel Problem",
      "Other",
    ];
    const allowedSeverity = ["Low", "Medium", "High", "Critical"];

    if (!allowedTypes.includes(problemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem type",
      });
    }

    if (!allowedSeverity.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity",
      });
    }

    const driverProfile = await Driver.findOne({ user: req.user.id });
    if (!driverProfile || !driverProfile.assignedBus) {
      return res.status(400).json({
        success: false,
        message: "No bus assigned to you",
      });
    }

    const BusProblem = require("../../database/models/BusProblem");

    const problem = await BusProblem.create({
      bus: driverProfile.assignedBus,
      driver: driverProfile._id,
      reportedBy: req.user.id,
      problemType,
      description,
      severity,
      status: "Open",
    });

    res.status(201).json({
      success: true,
      message: "Problem reported successfully",
      problem,
    });
  } catch (error) {
    console.error("Report problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reporting problem",
    });
  }
};

// GET /api/driver/problems
const getMyProblems = async (req, res) => {
  try {
    const driverProfile = await Driver.findOne({ user: req.user.id });

    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    const BusProblem = require("../../database/models/BusProblem");

    const problems = await BusProblem.find({
      driver: driverProfile._id,
    })
      .populate("bus", "busNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Get my problems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
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
  getMyProblems,
};