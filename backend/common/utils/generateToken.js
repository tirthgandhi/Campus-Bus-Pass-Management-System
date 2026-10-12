const jwt = require('jsonwebtoken');
module.exports = (id, role) => jwt.sign({ id: String(id), role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' });
