const Student = require('../../database/models/Student');
const Driver = require('../../database/models/Driver');
const Admin = require('../../database/models/Admin');
const { fail, text, pick } = require('../utils/http');
const { emailPattern, phonePattern } = require('../../database/helpers/account');
const models = Object.freeze({ student: Student, driver: Driver, admin: Admin });
const validRole = role => { if (typeof role !== 'string' || !Object.hasOwn(models, role)) fail(400, 'Choose student, driver or admin.'); return role; };
const email = value => { const normalized = text(value, 'Email', { max: 254 }).toLowerCase(); if (!emailPattern.test(normalized)) fail(400, 'Enter a valid email address.'); return normalized; };
function password(value) { if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) fail(400, 'Password must be at least 8 characters and at most 72 UTF-8 bytes.'); return value; }
function phone(value) { const normalized = text(value, 'Phone', { max: 20 }); if (!phonePattern.test(normalized) || normalized.replace(/\D/g, '').length < 7 || normalized.replace(/\D/g, '').length > 15) fail(400, 'Enter a valid phone number.'); return normalized; }
function registration(body) {
  const role = validRole(body.role);
  if (role === 'admin') fail(403, 'Administrator accounts are provisioned by the university.');
  const data = { name: text(body.name, 'Full name'), phone: phone(body.phone), password: password(body.password) };
  if (role === 'student') Object.assign(data, {
    studentId: text(body.studentId, 'Enrollment number', { max: 60 }).toUpperCase(),
    collegeEmail: email(body.collegeEmail ?? body.email),
    department: text(body.department, 'Department'),
    ...pick(body, ['semester']),
  });
  else Object.assign(data, { email: email(body.email), licenseNumber: text(body.licenseNumber, 'License number', { max: 60 }).toUpperCase() });
  return { role, data };
}
function identity(account, role) { return { _id: account._id, name: account.name, email: role === 'student' ? account.collegeEmail : account.email, role }; }
module.exports = { models, validRole, email, password, phone, registration, identity };
