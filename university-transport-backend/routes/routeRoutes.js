const express = require("express");

const {
    createRoute,
    getRoutes,
    updateRoute,
    deleteRoute
} = require("../controllers/routeController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createRoute
);

router.get(
    "/",
    protect,
    authorize("admin"),
    getRoutes
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateRoute
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteRoute
);

module.exports = router;