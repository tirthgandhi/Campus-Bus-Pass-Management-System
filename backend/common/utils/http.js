const mongoose = require('mongoose');
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
const id = (value, label = 'ID') => {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) fail(400, `Invalid ${label}.`);
  return value;
};
const text = (value, label, { max = 160 } = {}) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, `${label} is required and must be at most ${max} characters.`);
  return value.trim();
};
const pick = (object, fields) => Object.fromEntries(fields.filter(key => object[key] !== undefined).map(key => [key, object[key]]));
const ok = (res, data = {}, message = 'Operation successful', status = 200) => res.status(status).json({ success: true, message, data });
const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const found = (record, label) => { if (!record) fail(404, `${label} not found.`); return record; };
const sameId = (first, second) => Boolean(first && second && String(first._id || first) === String(second._id || second));
function day(value) {
  const dateText = value || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (typeof dateText !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) fail(400, 'Date must use YYYY-MM-DD.');
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateText) fail(400, 'Enter a valid date.');
  return date;
}
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) return res.status(error.status).json({ success: false, message: error.message });
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'A record with these details already exists.' });
  if (['ValidationError', 'CastError', 'StrictModeError'].includes(error.name) || error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Check the information you entered and try again.' });
  return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
}
module.exports = { HttpError, fail, id, text, pick, ok, wrap, found, sameId, day, errorHandler };
