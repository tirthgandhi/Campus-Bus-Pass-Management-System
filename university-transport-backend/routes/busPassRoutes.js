const express = require("express");

const {
    createBusPass,
    getMyBusPass
} = require("../controllers/busPassController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("student"),
    createBusPass
);

router.get(
    "/my",
    protect,
    authorize("student"),
    getMyBusPass
);

module.exports = router;