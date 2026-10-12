const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, match: /^[A-Z0-9-]+$/ },
  registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  capacity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  busType: { type: String, enum: ['university', 'hired'], default: 'university' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  // Incremented within assignment transactions to serialize capacity checks.
  assignmentSequence: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
schema.index({ assignedDriver: 1 }, { unique: true, partialFilterExpression: { assignedDriver: { $type: 'objectId' } } });
module.exports = mongoose.model('Bus', schema);
