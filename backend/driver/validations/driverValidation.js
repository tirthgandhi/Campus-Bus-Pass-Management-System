'use strict';

const mongoose = require('mongoose');
const { fail } = require('../../common/utils/http');
const { emailPattern, phonePattern } = require('../../database/helpers/account');

function validateRegistration(body) {
  if (!body || typeof body !== 'object') {
    fail(400, 'Registration details are required.');
  }

  const { name, email, phone, licenseNumber, password } = body;

  if (typeof name !== 'string' || !name.trim()) {
    fail(400, 'Name is required.');
  }
  if (name.trim().length > 100) {
    fail(400, 'Name cannot exceed 100 characters.');
  }

  if (typeof email !== 'string' || !email.trim()) {
    fail(400, 'Email is required.');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    fail(400, 'Enter a valid email address.');
  }

  if (typeof phone !== 'string' || !phone.trim()) {
    fail(400, 'Phone is required.');
  }
  const normalizedPhone = phone.trim();
  const digitsOnly = normalizedPhone.replace(/\D/g, '');
  if (!phonePattern.test(normalizedPhone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
    fail(400, 'Enter a valid phone number.');
  }

  if (typeof licenseNumber !== 'string' || !licenseNumber.trim()) {
    fail(400, 'License number is required.');
  }
  const normalizedLicense = licenseNumber.trim().toUpperCase();
  if (normalizedLicense.length > 50) {
    fail(400, 'License number cannot exceed 50 characters.');
  }

  if (typeof password !== 'string' || !password) {
    fail(400, 'Password is required.');
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    fail(400, 'Password must be at least 8 characters and at most 72 UTF-8 bytes.');
  }

  return {
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    licenseNumber: normalizedLicense,
    password,
  };
}

function validateProfileUpdate(body) {
  if (!body || typeof body !== 'object') {
    fail(400, 'Update details are required.');
  }

  const disallowed = ['password', 'role', 'assignedBus', 'assignedRoute', 'status', 'isVerified', '_id', 'driverId'];
  for (const key of disallowed) {
    if (body[key] !== undefined) {
      fail(400, `Updating ${key} is not permitted.`);
    }
  }

  const updates = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      fail(400, 'Name cannot be empty.');
    }
    if (body.name.trim().length > 100) {
      fail(400, 'Name cannot exceed 100 characters.');
    }
    updates.name = body.name.trim();
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string' || !body.phone.trim()) {
      fail(400, 'Phone cannot be empty.');
    }
    const normalizedPhone = body.phone.trim();
    const digitsOnly = normalizedPhone.replace(/\D/g, '');
    if (!phonePattern.test(normalizedPhone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      fail(400, 'Enter a valid phone number.');
    }
    updates.phone = normalizedPhone;
  }

  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !body.email.trim()) {
      fail(400, 'Email cannot be empty.');
    }
    const normalizedEmail = body.email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      fail(400, 'Enter a valid email address.');
    }
    updates.email = normalizedEmail;
  }

  if (Object.keys(updates).length === 0) {
    fail(400, 'Provide at least one safe field to update (name, phone, email).');
  }

  return updates;
}

function validateBusPass(body) {
  if (!body || typeof body !== 'object') {
    fail(400, 'Bus pass ID is required.');
  }
  const { busPassId } = body;
  if (typeof busPassId !== 'string' || !busPassId.trim()) {
    fail(400, 'Bus pass ID is required.');
  }
  return busPassId.trim();
}

function validateAttendanceInput(body) {
  if (!body || typeof body !== 'object') {
    fail(400, 'Attendance details are required.');
  }

  const busPassId = typeof body.busPassId === 'string' ? body.busPassId.trim() : null;
  const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : null;

  if (!busPassId && !studentId) {
    fail(400, 'Bus pass ID is required.');
  }

  let status = 'present';
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !['present', 'absent'].includes(body.status.toLowerCase())) {
      fail(400, 'Invalid status. Must be present or absent.');
    }
    status = body.status.toLowerCase();
  }

  return { busPassId, studentId, status };
}

function validateObjectId(value, label = 'ID') {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) {
    fail(400, `Invalid ${label}.`);
  }
  return value;
}

function validatePagination(query = {}) {
  let page = parseInt(query.page, 10);
  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) {
    limit = 10;
  }
  if (limit > 100) {
    limit = 100;
  }

  const search = typeof query.search === 'string' ? query.search.trim() : '';

  return { page, limit, search };
}

module.exports = {
  validateRegistration,
  validateProfileUpdate,
  validateBusPass,
  validateAttendanceInput,
  validateObjectId,
  validatePagination,
};
