/**
 * roleMiddleware.js
 * ─────────────────
 * Standalone role-based access control (RBAC) middleware.
 * Must be used AFTER the `protect` middleware so req.user is already set.
 *
 * Usage:
 *   const { authorizeRoles } = require('../middleware/roleMiddleware');
 *
 *   // Admin only
 *   router.get('/students', protect, authorizeRoles('admin'), getStudents);
 *
 *   // Multiple roles
 *   router.get('/bus-info', protect, authorizeRoles('driver', 'admin'), getBusInfo);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Run protect middleware first.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
