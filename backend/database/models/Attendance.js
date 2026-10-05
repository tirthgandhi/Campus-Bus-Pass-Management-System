const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  pickupPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupPoint', required: true },
  busPassId: { type: String, required: true, trim: true },
  // A campus calendar day represented by UTC midnight, never a timestamp.
  date: { type: Date, required: true, set: value => { const date = new Date(value); if (Number.isFinite(date.getTime())) date.setUTCHours(0, 0, 0, 0); return date; } },
  boardingTime: { type: Date, default: null },
  markedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], required: true },
}, { timestamps: true });
schema.index({ student: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', schema);
