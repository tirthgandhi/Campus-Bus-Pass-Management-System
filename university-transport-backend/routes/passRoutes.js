const express = require("express");

const {
    applyForPass,
    getMyPasses
} = require("../controllers/passController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("student"),
    applyForPass
);

router.get(
    "/my",
    protect,
    authorize("student"),
    getMyPasses
);

module.exports = router;