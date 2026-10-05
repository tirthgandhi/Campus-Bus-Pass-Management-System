const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { models, identity } = require('../services/accounts');
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!Object.hasOwn(models, decoded.role) || !mongoose.isObjectIdOrHexString(decoded.id)) throw new Error('Invalid identity');
  } catch { return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' }); }
  try {
    const account = await models[decoded.role].findById(decoded.id);
    if (!account) return res.status(401).json({ success: false, message: 'Account no longer exists. Please sign in again.' });
    if (account.status === 'inactive' || account.transportStatus === 'inactive') return res.status(403).json({ success: false, message: 'This account is inactive.' });
    req.account = account;
    req.user = { ...identity(account, decoded.role), id: String(account._id) };
    next();
  } catch (error) { next(error); }
};
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You do not have permission to access this page.' });
  next();
};
module.exports = { protect, authorize };
