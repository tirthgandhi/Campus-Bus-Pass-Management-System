const Bus = require("../../database/models/Bus");
const Driver = require("../../database/models/Driver");
const Student = require("../../database/models/Student");
const Route = require("../../database/models/Route");
const PickupPoint = require("../../database/models/PickupPoint");
const TransportRequest = require("../../database/models/TransportRequest");
const BusAssignment = require("../../database/models/BusAssignment");
const Attendance = require("../../database/models/Attendance");
const BusProblem = require("../../database/models/BusProblem");

// ---------- Bus Management ----------
const createBus = async (req, res) => {
  try {
    const { busNumber, registrationNumber, capacity, busType, status } = req.body;

    if (!busNumber || !registrationNumber || !capacity || !busType) {
      return res.status(400).json({
        message: "busNumber, registrationNumber, capacity and busType are required",
      });
    }

    const existingBus = await Bus.findOne({
      $or: [{ busNumber }, { registrationNumber }],
    });

    if (existingBus) {
      return res.status(400).json({
        message: "Bus number or registration number already exists",
      });
    }

    const bus = await Bus.create({
      busNumber,
      registrationNumber,
      capacity,
      busType,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Create bus error:", error.message);
    return res.status(500).json({ message: "Server error while creating bus" });
  }
};

const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get buses error:", error.message);
    return res.status(500).json({ message: "Server error while fetching buses" });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    return res.status(200).json({ bus });
  } catch (error) {
    console.error("Get bus error:", error.message);
    return res.status(500).json({ message: "Server error while fetching bus" });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    return res.status(200).json({
      message: "Bus updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Update bus error:", error.message);
    return res.status(500).json({ message: "Server error while updating bus" });
  }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    return res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete bus error:", error.message);
    return res.status(500).json({ message: "Server error while deleting bus" });
  }
};

// ---------- Route Management ----------
const createRoute = async (req, res) => {
  try {
    const { routeName, routeCode, description, startPoint, endPoint, status } = req.body;

    if (!routeName || !routeCode || !startPoint || !endPoint) {
      return res.status(400).json({
        message: "routeName, routeCode, startPoint and endPoint are required",
      });
    }

    const existingRoute = await Route.findOne({ routeCode });

    if (existingRoute) {
      return res.status(400).json({ message: "Route code already exists" });
    }

    const route = await Route.create({
      routeName,
      routeCode,
      description: description || "",
      startPoint,
      endPoint,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create route error:", error.message);
    return res.status(500).json({ message: "Server error while creating route" });
  }
};

const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate("pickupPoints").populate("assignedBus").populate("assignedDriver").sort({ createdAt: -1 });

    return res.status(200).json({
      count: routes.length,
      routes,
    });
  } catch (error) {
    console.error("Get routes error:", error.message);
    return res.status(500).json({ message: "Server error while fetching routes" });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate("pickupPoints").populate("assignedBus").populate("assignedDriver");

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.status(200).json({ route });
  } catch (error) {
    console.error("Get route error:", error.message);
    return res.status(500).json({ message: "Server error while fetching route" });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.status(200).json({
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
    console.error("Update route error:", error.message);
    return res.status(500).json({ message: "Server error while updating route" });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Delete route error:", error.message);
    return res.status(500).json({ message: "Server error while deleting route" });
  }
};

// ---------- Pickup Point Management ----------
const createPickupPoint = async (req, res) => {
  try {
    const { name, location, landmark, route: routeId, sequence, status } = req.body;

    if (!name || !location || !routeId || !sequence) {
      return res.status(400).json({
        message: "name, location, route, and sequence are required",
      });
    }

    const routeExists = await Route.findById(routeId);

    if (!routeExists) {
      return res.status(404).json({ message: "Route not found" });
    }

    const pickupPoint = await PickupPoint.create({
      name,
      location,
      landmark: landmark || "",
      route: routeId,
      sequence,
      status: status || "active",
    });

    routeExists.pickupPoints.push(pickupPoint._id);
    await routeExists.save();

    return res.status(201).json({
      message: "Pickup point created successfully",
      pickupPoint,
    });
  } catch (error) {
    console.error("Create pickup point error:", error.message);
    return res.status(500).json({ message: "Server error while creating pickup point" });
  }
};

const getPickupPoints = async (req, res) => {
  try {
    const pickupPoints = await PickupPoint.find().populate("route").sort({ createdAt: -1 });

    return res.status(200).json({
      count: pickupPoints.length,
      pickupPoints,
    });
  } catch (error) {
    console.error("Get pickup points error:", error.message);
    return res.status(500).json({ message: "Server error while fetching pickup points" });
  }
};

const getPickupPointById = async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.findById(req.params.id).populate("route");

    if (!pickupPoint) {
      return res.status(404).json({ message: "Pickup point not found" });
    }

    return res.status(200).json({ pickupPoint });
  } catch (error) {
    console.error("Get pickup point error:", error.message);
    return res.status(500).json({ message: "Server error while fetching pickup point" });
  }
};

// ---------- Transport Request Management ----------
const getPendingTransportRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find({ status: "pending" })
      .populate("student")
      .populate("pickupPoint")
      .populate("requestedRoute")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get pending transport requests error:", error.message);
    return res.status(500).json({ message: "Server error while fetching pending transport requests" });
  }
};

const getTransportRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find()
      .populate("student")
      .populate("pickupPoint")
      .populate("requestedRoute")
      .populate("reviewedBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get transport requests error:", error.message);
    return res.status(500).json({ message: "Server error while fetching transport requests" });
  }
};

const approveTransportRequest = async (req, res) => {
  try {
    const request = await TransportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Transport request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Transport request is already ${request.status}` });
    }

    request.status = "approved";
    request.reviewedBy = req.user && req.user._id ? req.user._id : null;
    request.reviewedAt = new Date();
    request.rejectionReason = null;

    await request.save();

    return res.status(200).json({
      message: "Transport request approved successfully",
      request,
    });
  } catch (error) {
    console.error("Approve transport request error:", error.message);
    return res.status(500).json({ message: "Server error while approving transport request" });
  }
};

const rejectTransportRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: "rejectionReason is required" });
    }

    const request = await TransportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Transport request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Transport request is already ${request.status}` });
    }

    request.status = "rejected";
    request.reviewedBy = req.user && req.user._id ? req.user._id : null;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();

    return res.status(200).json({
      message: "Transport request rejected successfully",
      request,
    });
  } catch (error) {
    console.error("Reject transport request error:", error.message);
    return res.status(500).json({ message: "Server error while rejecting transport request" });
  }
};

const allocateStudentToBus = async (req, res) => {
  try {
    const { studentId, busId, routeId, pickupPointId, busPassId } = req.body;

    if (!studentId || !busId || !routeId || !pickupPointId || !busPassId) {
      return res.status(400).json({
        message: "studentId, busId, routeId, pickupPointId and busPassId are required",
      });
    }

    const student = await Student.findById(studentId);
    const bus = await Bus.findById(busId);
    const route = await Route.findById(routeId);
    const pickupPoint = await PickupPoint.findById(pickupPointId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    if (!pickupPoint) {
      return res.status(404).json({ message: "Pickup point not found" });
    }

    const assignment = await BusAssignment.findOneAndUpdate(
      { student: studentId },
      {
        student: studentId,
        bus: busId,
        route: routeId,
        pickupPoint: pickupPointId,
        busPassId,
        assignedBy: req.user && req.user._id ? req.user._id : null,
        assignedAt: new Date(),
        status: "active",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    student.assignedBus = busId;
    student.assignedRoute = routeId;
    student.pickupPoint = pickupPointId;
    student.busPassId = busPassId;
    student.transportStatus = "approved";
    await student.save();

    return res.status(200).json({
      message: "Student allocated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Allocate student error:", error.message);
    return res.status(500).json({ message: "Server error while allocating student" });
  }
};

// ---------- Driver Assignment ----------
const assignDriverToBus = async (req, res) => {
  try {
    const { driverId, routeId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "driverId is required" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    driver.assignedBus = bus._id;

    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      driver.assignedRoute = route._id;
      route.assignedDriver = driver._id;
      await route.save();
    }

    await driver.save();

    return res.status(200).json({
      message: "Driver assigned successfully",
      driver,
      bus,
    });
  } catch (error) {
    console.error("Assign driver error:", error.message);
    return res.status(500).json({ message: "Server error while assigning driver" });
  }
};

const assignDriverToRoute = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "driverId is required" });
    }

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.assignedRoute = route._id;
    route.assignedDriver = driver._id;

    await driver.save();
    await route.save();

    return res.status(200).json({
      message: "Driver assigned to route successfully",
      driver,
      route,
    });
  } catch (error) {
    console.error("Assign driver to route error:", error.message);
    return res.status(500).json({ message: "Server error while assigning driver to route" });
  }
};

// ---------- Attendance ----------
const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("student")
      .populate("bus")
      .populate("route")
      .populate("pickupPoint")
      .populate("markedBy")
      .sort({ date: -1 });

    return res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error.message);
    return res.status(500).json({ message: "Server error while fetching attendance" });
  }
};

// ---------- Bus Problem Reports ----------
const getBusProblems = async (req, res) => {
  try {
    const reports = await BusProblem.find()
      .populate("bus")
      .populate("driver")
      .populate("route")
      .populate("resolvedBy")
      .sort({ reportedAt: -1 });

    return res.status(200).json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get bus problems error:", error.message);
    return res.status(500).json({ message: "Server error while fetching bus problems" });
  }
};

const updateBusProblemStatus = async (req, res) => {
  try {
    const { status, resolvedBy } = req.body;

    const problem = await BusProblem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Bus problem not found" });
    }

    if (status) {
      problem.status = status;
    }

    if (resolvedBy) {
      problem.resolvedBy = resolvedBy;
      problem.resolvedAt = new Date();
    }

    await problem.save();

    return res.status(200).json({
      message: "Bus problem updated successfully",
      problem,
    });
  } catch (error) {
    console.error("Update bus problem error:", error.message);
    return res.status(500).json({ message: "Server error while updating bus problem" });
  }
};

module.exports = {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  createPickupPoint,
  getPickupPoints,
  getPickupPointById,
  getPendingTransportRequests,
  getTransportRequests,
  approveTransportRequest,
  rejectTransportRequest,
  allocateStudentToBus,
  assignDriverToBus,
  assignDriverToRoute,
  getAttendance,
  getBusProblems,
  updateBusProblemStatus,
};
