const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  signup,
  login,
  getMe,
  registerUser,
  verifyEmail,
  loginUser,
  resetDriverPassword,
} = require("../controllers/authController");

// ── Health check ──────────────────────────────────────────────────────────────
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Authentication route is working ✅" });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ISSUE #1 — SPEC ROUTES  (used for Postman tests)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/signup  → register + return token immediately
router.post("/signup", signup);

// POST /api/auth/login   → login, no email-verification gate
router.post("/login", login);

// GET  /api/auth/me      → return current logged-in user (protected)
router.get("/me", protect, getMe);

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENDED FLOW — Email verification (register → verify → login-verified)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register      → register, sends verification email
router.post("/register", registerUser);

// GET  /api/auth/verify-email  → verify email token from inbox
router.get("/verify-email", verifyEmail);

// POST /api/auth/login-verified → login only after email is verified
router.post("/login-verified", loginUser);

// POST /api/auth/reset-driver-password
router.post("/reset-driver-password", resetDriverPassword);

// ── Role-gated demo routes (for team reference) ───────────────────────────────
router.get("/student-only", protect, authorize("student"), (req, res) => {
  res.json({ success: true, message: "Welcome, student!", user: req.user });
});

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome, admin!", user: req.user });
});

router.get("/driver-only", protect, authorize("driver"), (req, res) => {
  res.json({ success: true, message: "Welcome, driver!", user: req.user });
});

module.exports = router;
