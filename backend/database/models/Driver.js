const mongoose = require('mongoose');
const { addAuthentication, emailField, phoneField, identifier } = require('../helpers/account');
const schema = new mongoose.Schema({
  driverId: identifier('DRV'),
  name: { type: String, required: true, trim: true },
  email: emailField(),
  phone: phoneField(),
  licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
addAuthentication(schema);
module.exports = mongoose.model('Driver', schema);
