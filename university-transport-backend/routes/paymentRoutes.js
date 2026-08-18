const express = require("express");

const {
    createPayment,
    getMyPayments
} = require("../controllers/paymentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Student records a payment
router.post(
    "/",
    protect,
    authorize("student"),
    createPayment
);

// Student views their own payments
router.get(
    "/my",
    protect,
    authorize("student"),
    getMyPayments
);

module.exports = router;