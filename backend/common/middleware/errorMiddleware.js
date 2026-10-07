const { HttpError } = require('../utils/http');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) return res.status(error.status).json({ success: false, message: error.message });
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'A record with these details already exists.' });
  if (['ValidationError', 'CastError', 'StrictModeError'].includes(error.name) || error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Check the information you entered and try again.' });
  return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;
