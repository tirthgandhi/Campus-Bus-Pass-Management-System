const mongoose = require('mongoose');
const { addAuthentication, emailField, phoneField, identifier } = require('../helpers/account');
const schema = new mongoose.Schema({
  adminId: identifier('ADM'),
  name: { type: String, required: true, trim: true },
  email: emailField(),
  phone: phoneField(false),
  department: { type: String, trim: true, default: 'Transportation' },
}, { timestamps: true });
addAuthentication(schema, { verification: false });
module.exports = mongoose.model('Admin', schema);
