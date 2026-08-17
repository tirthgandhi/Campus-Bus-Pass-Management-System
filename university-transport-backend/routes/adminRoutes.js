const express = require("express");

const {
    createBus,
    getBuses,
    getBusById,
    updateBus,
    deleteBus,
    getPendingPasses,
    approvePass,
    rejectPass,
    assignRouteToPass,
    assignDriverToBus
} = require("../controllers/adminController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// All admin bus routes require:
// 1. Valid JWT
// 2. Admin role

router.post(
    "/buses",
    protect,
    authorize("admin"),
    createBus
);

router.get(
    "/buses",
    protect,
    authorize("admin"),
    getBuses
);

router.get(
    "/buses/:id",
    protect,
    authorize("admin"),
    getBusById
);

router.put(
    "/passes/:id/route",
    protect,
    authorize("admin"),
    assignRouteToPass
);

router.delete(
    "/buses/:id",
    protect,
    authorize("admin"),
    deleteBus
);
router.get(
    "/passes/pending",
    protect,
    authorize("admin"),
    getPendingPasses
);

router.put(
    "/passes/:id/approve",
    protect,
    authorize("admin"),
    approvePass
);

router.put(
    "/passes/:id/reject",
    protect,
    authorize("admin"),
    rejectPass
);
router.put(
    "/buses/:id/driver",
    protect,
    authorize("admin"),
    assignDriverToBus
);

module.exports = router;