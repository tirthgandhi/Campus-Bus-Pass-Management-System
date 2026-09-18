const express = require("express");
const {
    protect,
    authorize
} = require("./middleware/authMiddleware");
const {
    registerUser,
    verifyEmail,
    loginUser,
    resetDriverPassword
} = require("./controllers/authController");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        message: "Authentication route is working"
    });
});

router.post("/register", registerUser);

router.get("/verify-email", verifyEmail);

router.post("/login", loginUser);

router.post("/reset-driver-password", resetDriverPassword);

router.get("/me", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get("/student-only", protect, authorize("student"), (req, res) => {
    res.json({
        message: "Welcome student! You have access to this route.",
        user: req.user
    });
});

module.exports = router;
