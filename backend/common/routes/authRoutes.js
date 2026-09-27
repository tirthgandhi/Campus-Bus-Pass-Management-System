const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
  resetDriverPassword,
} = require("../controllers/authController");

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/test", (req, res) => {
  res.json({ message: "Authentication route is working ✅" });
});

// POST /api/auth/register  → signup
router.post("/register", registerUser);
// Alias kept for spec compatibility
router.post("/signup", registerUser);

// GET  /api/auth/verify-email?token=...
router.get("/verify-email", verifyEmail);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/reset-driver-password  (admin operation — no auth guard yet)
router.post("/reset-driver-password", resetDriverPassword);

// ── Protected routes ──────────────────────────────────────────────────────────

// GET /api/auth/me  → returns current logged-in user
router.get("/me", protect, getMe);

// Role-specific example routes
router.get("/student-only", protect, authorize("student"), (req, res) => {
  res.json({ success: true, message: "Welcome, student!", user: req.user });
});

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome, admin!", user: req.user });
});

router.get(
  "/driver-only",
  protect,
  authorize("driver"),
  (req, res) => {
    res.json({ success: true, message: "Welcome, driver!", user: req.user });
  }
);

module.exports = router;
