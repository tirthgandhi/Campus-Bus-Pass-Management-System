const jwt = require("jsonwebtoken");
const User = require("../../database/models/User");

/**
 * protect — verifies Bearer JWT and attaches full user (no password) to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user object (excluding password) to req
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User no longer exists.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

/**
 * authorize — role-based access control middleware
 * @param  {...string} allowedRoles  - e.g. authorize('admin'), authorize('student', 'admin')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
