const mongoose = require('mongoose');
const { addAuthentication, emailField, phoneField } = require('../helpers/account');
const schema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  collegeEmail: emailField(),
  phone: phoneField(),
  department: { type: String, required: true, trim: true },
  semester: { type: Number, min: 1, max: 12, validate: Number.isInteger },
  transportStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' },
}, { timestamps: true });
addAuthentication(schema);
module.exports = mongoose.model('Student', schema);
