/**
 * Student Backend API Tests
 * Run: node tests/student-api-tests.js
 */
'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const BASE = 'http://localhost:5000/api';
let studentToken = '';
let pickupPointId = '';
let passed = 0;
let failed = 0;

async function req(method, url, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  let data;
  try { data = await r.json(); } catch { data = {}; }
  return { status: r.status, data };
}

function test(name, status, data, expectStatus, expectFn) {
  const statusOk = status === expectStatus;
  const dataOk = expectFn ? expectFn(data) : true;
  const ok = statusOk && dataOk;
  if (ok) { passed++; console.log(`  ✅ PASS  ${name}`); }
  else {
    failed++;
    console.log(`  ❌ FAIL  ${name}`);
    if (!statusOk) console.log(`         Expected status ${expectStatus}, got ${status}`);
    if (!dataOk)   console.log(`         Data check failed:`, JSON.stringify(data).slice(0, 200));
  }
  return ok;
}

async function run() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('  CAMPUS BUS PASS — STUDENT BACKEND API TESTS');
  console.log('════════════════════════════════════════════════════\n');

  // Seed: delete test student if exists (ignore error)
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI);
  const Student = require('../database/models/Student');
  const TransportRequest = require('../database/models/TransportRequest');
  await Student.deleteOne({ collegeEmail: 'tirth@gsfc.edu' });
  await mongoose.disconnect();

  // ── 01 REGISTER ─────────────────────────────────────────────────────────────
  console.log('── 01 STUDENT REGISTRATION');
  let r = await req('POST', `${BASE}/students/register`, {
    name: 'Tirth Gandhi', studentId: '25BT04D240',
    collegeEmail: 'tirth@gsfc.edu', phone: '9876543210',
    department: 'CSE', semester: 5, password: 'Student@123',
  });
  test('T01 Register new student', r.status, r.data, 201, d => d.success === true);

  // ── 02 DUPLICATE REGISTER ────────────────────────────────────────────────────
  console.log('\n── 02 DUPLICATE REGISTRATION');
  r = await req('POST', `${BASE}/students/register`, {
    name: 'Tirth Gandhi', studentId: '25BT04D240',
    collegeEmail: 'tirth@gsfc.edu', phone: '9876543210',
    department: 'CSE', semester: 5, password: 'Student@123',
  });
  test('T02 Duplicate email/enrollment → 409', r.status, r.data, 409, d => d.success === false);

  // ── 03 LOGIN ─────────────────────────────────────────────────────────────────
  console.log('\n── 03 STUDENT LOGIN');
  r = await req('POST', `${BASE}/auth/login`, { email: 'tirth@gsfc.edu', password: 'Student@123', role: 'student' });
  const loginOk = test('T03 Login → 200 + token', r.status, r.data, 200, d => d.success && d.data?.token);
  if (loginOk) studentToken = r.data.data.token;

  // ── 04 WRONG PASSWORD ────────────────────────────────────────────────────────
  console.log('\n── 04 WRONG PASSWORD');
  r = await req('POST', `${BASE}/auth/login`, { email: 'tirth@gsfc.edu', password: 'WrongPass', role: 'student' });
  test('T04 Wrong password → 401', r.status, r.data, 401, d => d.success === false);

  // ── 05 NO TOKEN ──────────────────────────────────────────────────────────────
  console.log('\n── 05 NO TOKEN');
  r = await req('GET', `${BASE}/students/profile`);
  test('T05 No token → 401', r.status, r.data, 401, d => d.success === false);

  const auth = { Authorization: `Bearer ${studentToken}` };

  // ── 06 GET PROFILE ───────────────────────────────────────────────────────────
  console.log('\n── 06 GET PROFILE');
  r = await req('GET', `${BASE}/students/profile`, null, auth);
  test('T06 Get profile → 200', r.status, r.data, 200,
    d => d.success && d.data?.name && !d.data?.password);

  // ── 07 UPDATE PROFILE ────────────────────────────────────────────────────────
  console.log('\n── 07 UPDATE PROFILE');
  r = await req('PUT', `${BASE}/students/profile`, { name: 'Tirth Gandhi', phone: '9999999999', department: 'CSE' }, auth);
  test('T07 Update profile → 200', r.status, r.data, 200,
    d => d.success && d.data?.phone === '9999999999');

  // ── 08 GET PICKUP POINTS ─────────────────────────────────────────────────────
  console.log('\n── 08 GET PICKUP POINTS');
  r = await req('GET', `${BASE}/students/pickup-points`, null, auth);
  const ppOk = test('T08 Pickup points → 200', r.status, r.data, 200, d => d.success && Array.isArray(d.data));
  if (ppOk && r.data.data.length > 0) {
    pickupPointId = r.data.data[0]._id;
    console.log(`         pickup_point_id: ${pickupPointId}`);
  } else {
    console.log('         ⚠  No pickup points in DB — skipping request submission tests');
  }

  // ── 09 SUBMIT TRANSPORT REQUEST ──────────────────────────────────────────────
  console.log('\n── 09 SUBMIT TRANSPORT REQUEST');
  if (pickupPointId) {
    r = await req('POST', `${BASE}/students/transport-request`, { pickupPointId }, auth);
    test('T09 Submit request → 201 pending', r.status, r.data, 201,
      d => d.success && d.data?.status === 'pending');
  } else {
    console.log('  ⚠  SKIP (no pickup points)');
  }

  // ── 10 DUPLICATE REQUEST ─────────────────────────────────────────────────────
  console.log('\n── 10 DUPLICATE TRANSPORT REQUEST');
  if (pickupPointId) {
    r = await req('POST', `${BASE}/students/transport-request`, { pickupPointId }, auth);
    test('T10 Duplicate request → 409', r.status, r.data, 409, d => d.success === false);
  } else {
    console.log('  ⚠  SKIP (no pickup points)');
  }

  // ── 11 INVALID PICKUP POINT ──────────────────────────────────────────────────
  console.log('\n── 11 INVALID PICKUP POINT');
  r = await req('POST', `${BASE}/students/transport-request`, { pickupPointId: 'notanobjectid123' }, auth);
  test('T11 Invalid pickup ID → 400', r.status, r.data, 400, d => d.success === false);

  // ── 12 GET TRANSPORT REQUEST ─────────────────────────────────────────────────
  console.log('\n── 12 GET TRANSPORT REQUEST');
  r = await req('GET', `${BASE}/students/transport-request`, null, auth);
  test('T12 Get transport request → 200', r.status, r.data, 200,
    d => d.success && d.data?.status);

  // ── 14 GET ASSIGNMENT (none yet) ─────────────────────────────────────────────
  console.log('\n── 14 GET ASSIGNMENT (none)');
  r = await req('GET', `${BASE}/students/assignment`, null, auth);
  test('T14 No assignment → 404', r.status, r.data, 404, d => d.success === false);

  // ── 17 GET BUS PASS (none yet) ───────────────────────────────────────────────
  console.log('\n── 17 GET BUS PASS (none)');
  r = await req('GET', `${BASE}/students/bus-pass`, null, auth);
  test('T17 No bus pass → 404', r.status, r.data, 404, d => d.success === false);

  // ── 18 ATTENDANCE HISTORY ────────────────────────────────────────────────────
  console.log('\n── 18 ATTENDANCE HISTORY');
  r = await req('GET', `${BASE}/students/attendance`, null, auth);
  test('T18 Attendance → 200 array', r.status, r.data, 200, d => d.success && Array.isArray(d.data));

  // ── 19 FILTER BY MONTH ───────────────────────────────────────────────────────
  console.log('\n── 19 FILTER ATTENDANCE BY MONTH');
  r = await req('GET', `${BASE}/students/attendance?month=10`, null, auth);
  test('T19 Attendance ?month=10 → 200', r.status, r.data, 200, d => d.success && Array.isArray(d.data));

  // ── 20 FILTER BY STATUS ──────────────────────────────────────────────────────
  console.log('\n── 20 FILTER ATTENDANCE BY STATUS');
  r = await req('GET', `${BASE}/students/attendance?status=present`, null, auth);
  test('T20 Attendance ?status=present → 200', r.status, r.data, 200, d => d.success && Array.isArray(d.data));

  // ── 21 DASHBOARD ─────────────────────────────────────────────────────────────
  console.log('\n── 21 DASHBOARD');
  r = await req('GET', `${BASE}/students/dashboard`, null, auth);
  test('T21 Dashboard → 200', r.status, r.data, 200,
    d => d.success && d.data?.student?.name && d.data?.attendance);

  // ── 22 DRIVER TOKEN ON STUDENT ROUTE ─────────────────────────────────────────
  console.log('\n── 22 WRONG ROLE (driver token)');
  // Login as existing driver or use existing student token and fake role
  const driverR = await req('POST', `${BASE}/auth/login`, { email: 'rahul.sharma@university.edu', password: 'Rahul1234', role: 'student' });
  // We don't have a driver account; simulate by using a tampered/invalid token
  r = await req('GET', `${BASE}/students/profile`, null, { Authorization: 'Bearer invalidDriverToken' });
  test('T22 Invalid/driver token → 401', r.status, r.data, 401, d => d.success === false);

  // ── 24 INVALID TOKEN ─────────────────────────────────────────────────────────
  console.log('\n── 24 INVALID TOKEN');
  r = await req('GET', `${BASE}/students/profile`, null, { Authorization: 'Bearer invalidtoken' });
  test('T24 Invalid token → 401', r.status, r.data, 401, d => d.success === false);

  // ── 25 MALFORMED OBJECT ID ───────────────────────────────────────────────────
  console.log('\n── 25 MALFORMED OBJECT ID');
  r = await req('POST', `${BASE}/students/transport-request`, { pickupPointId: '123' }, auth);
  test('T25 Malformed ObjectId → 400', r.status, r.data, 400, d => d.success === false);

  // ── SUMMARY ──────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Test runner error:', err.message); process.exit(1); });
