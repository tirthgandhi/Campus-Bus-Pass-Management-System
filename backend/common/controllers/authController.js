const crypto = require("crypto");
const User = require("../../database/models/User");
const generateToken = require("../utils/generateToken");
const { sendVerificationEmail } = require("../utils/email");

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register  (alias: /api/auth/signup)
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // 2. Duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 3. Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    // 4. Create user (password hashed by pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // 5. Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("❌ Verification email failed:", emailError.message);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message:
          "Registration failed because verification email could not be sent",
      });
    }

    // 6. Success — no token yet (email must be verified first)
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email?token=...
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("❌ Email verification error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Compare password using model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private (protect middleware attaches req.user)
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-driver-password
// @access  Admin only (enforced at route level)
// ────────────────────────────────────────────────────────────────────────────
const resetDriverPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email, role: "driver" });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Assign plain — pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Driver password reset successfully" });
  } catch (error) {
    console.error("❌ Password reset error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
  resetDriverPassword,
};
