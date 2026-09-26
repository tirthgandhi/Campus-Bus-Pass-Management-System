const express = require("express");
const { protect, authorize } = require("../common/middleware/authMiddleware");

const {
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
} = require("./controllers/adminController");

const router = express.Router();

// Bus management
router.post("/buses", protect, authorize("admin"), createBus);
router.get("/buses", protect, authorize("admin"), getBuses);
router.get("/buses/:id", protect, authorize("admin"), getBusById);
router.put("/buses/:id", protect, authorize("admin"), updateBus);
router.delete("/buses/:id", protect, authorize("admin"), deleteBus);
router.put("/buses/:id/driver", protect, authorize("admin"), assignDriverToBus);

// Route management
router.post("/routes", protect, authorize("admin"), createRoute);
router.get("/routes", protect, authorize("admin"), getRoutes);
router.get("/routes/:id", protect, authorize("admin"), getRouteById);
router.put("/routes/:id", protect, authorize("admin"), updateRoute);
router.delete("/routes/:id", protect, authorize("admin"), deleteRoute);
router.put("/routes/:id/driver", protect, authorize("admin"), assignDriverToRoute);

// Pickup point management
router.post("/pickup-points", protect, authorize("admin"), createPickupPoint);
router.get("/pickup-points", protect, authorize("admin"), getPickupPoints);
router.get("/pickup-points/:id", protect, authorize("admin"), getPickupPointById);

// Transport request management
router.get("/transport-requests", protect, authorize("admin"), getTransportRequests);
router.get("/transport-requests/pending", protect, authorize("admin"), getPendingTransportRequests);
router.put("/transport-requests/:id/approve", protect, authorize("admin"), approveTransportRequest);
router.put("/transport-requests/:id/reject", protect, authorize("admin"), rejectTransportRequest);
router.post("/students/allocate", protect, authorize("admin"), allocateStudentToBus);

// Attendance
router.get("/attendance", protect, authorize("admin"), getAttendance);

// Bus problem reports
router.get("/bus-problems", protect, authorize("admin"), getBusProblems);
router.put("/bus-problems/:id/status", protect, authorize("admin"), updateBusProblemStatus);

module.exports = router;
