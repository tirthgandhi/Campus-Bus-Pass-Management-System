const express = require("express");
const {
    protect,
    authorize
} = require("../common/middleware/authMiddleware");

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
} = require("./controllers/adminController");

const {
    createRoute,
    getRoutes,
    updateRoute,
    deleteRoute
} = require("./controllers/routeController");

const router = express.Router();

// ── Bus Management ────────────────────────────────────────────────────
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
    "/buses/:id",
    protect,
    authorize("admin"),
    updateBus
);

router.delete(
    "/buses/:id",
    protect,
    authorize("admin"),
    deleteBus
);

// ── Driver Assignment ─────────────────────────────────────────────────
router.put(
    "/buses/:id/driver",
    protect,
    authorize("admin"),
    assignDriverToBus
);

// ── Transport Request / Pass Management ───────────────────────────────
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
    "/passes/:id/route",
    protect,
    authorize("admin"),
    assignRouteToPass
);

// ── Route Management ──────────────────────────────────────────────────
router.post(
    "/routes",
    protect,
    authorize("admin"),
    createRoute
);

router.get(
    "/routes",
    protect,
    authorize("admin"),
    getRoutes
);

router.put(
    "/routes/:id",
    protect,
    authorize("admin"),
    updateRoute
);

router.delete(
    "/routes/:id",
    protect,
    authorize("admin"),
    deleteRoute
);

module.exports = router;
