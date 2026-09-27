const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token for a given user ID.
 * @param {string} userId  - MongoDB ObjectId of the user
 * @returns {string}       - Signed JWT token (expires in 7d)
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;
