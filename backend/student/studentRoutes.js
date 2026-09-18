const express = require("express");
const {
    protect,
    authorize
} = require("../common/middleware/authMiddleware");

const {
    applyForPass,
    getMyPasses
} = require("./controllers/passController");

const {
    createBusPass,
    getMyBusPass
} = require("./controllers/busPassController");

const {
    createPayment,
    getMyPayments
} = require("./controllers/paymentController");

const router = express.Router();

// ── Transport Request (Pass Application) ─────────────────────────────
// POST   /api/student/passes        → apply for a bus pass
// GET    /api/student/passes/my     → get own pass applications
router.post(
    "/passes",
    protect,
    authorize("student"),
    applyForPass
);

router.get(
    "/passes/my",
    protect,
    authorize("student"),
    getMyPasses
);

// ── Bus Pass (after approval) ─────────────────────────────────────────
// POST   /api/student/buspasses     → create bus pass (after payment)
// GET    /api/student/buspasses/my  → view own bus pass / pass ID
router.post(
    "/buspasses",
    protect,
    authorize("student"),
    createBusPass
);

router.get(
    "/buspasses/my",
    protect,
    authorize("student"),
    getMyBusPass
);

// ── Payments ──────────────────────────────────────────────────────────
// POST   /api/student/payments      → record a payment
// GET    /api/student/payments/my   → view own payment history
router.post(
    "/payments",
    protect,
    authorize("student"),
    createPayment
);

router.get(
    "/payments/my",
    protect,
    authorize("student"),
    getMyPayments
);

module.exports = router;
