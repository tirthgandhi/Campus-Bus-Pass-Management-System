/**
 * Driver Backend API Tests (Tests 1 - 30 + Cross-Module Flow)
 * Campus Bus Pass Management System
 * Run: node tests/driver-api-tests.js
 */
'use strict';

const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../common/config/db');
const app = require('../app');
const Driver = require('../database/models/Driver');
const Student = require('../database/models/Student');
const Admin = require('../database/models/Admin');
const Bus = require('../database/models/Bus');
const Route = require('../database/models/Route');
const PickupPoint = require('../database/models/PickupPoint');
const BusAssignment = require('../database/models/BusAssignment');
const Attendance = require('../database/models/Attendance');
const TransportRequest = require('../database/models/TransportRequest');

const PORT = 5055;
const BASE = `http://localhost:${PORT}/api`;

let server;
let driverToken = '';
let studentToken = '';
let adminToken = '';
let testDriverId = '';
let testStudentId = '';
let testOtherStudentId = '';
let testBusId = '';
let testOtherBusId = '';
let testRouteId = '';
let testPickupPointId = '';
let validBusPassId = 'GSFC-DRV-001';
let otherBusPassId = 'GSFC-DRV-002';

const results = [];
let passedCount = 0;
let failedCount = 0;

async function req(method, url, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  let data;
  try {
    data = await r.json();
  } catch {
    data = {};
  }
  return { status: r.status, data };
}

function recordTest({ id, name, api, method, url, headers, input, expectedStatus, actualStatus, expectedResult, actualResult, passed }) {
  if (passed) {
    passedCount++;
    console.log(`  ✅ PASS  [Test ${id}] ${name} (Status: ${actualStatus})`);
  } else {
    failedCount++;
    console.log(`  ❌ FAIL  [Test ${id}] ${name} (Expected: ${expectedStatus}, Actual: ${actualStatus})`);
    console.log(`         Details: ${JSON.stringify(actualResult).slice(0, 200)}`);
  }
  results.push({
    id,
    api,
    method,
    url,
    headers: headers ? JSON.stringify(headers) : 'none',
    input: input ? JSON.stringify(input) : 'none',
    expectedStatus,
    actualStatus,
    expectedResult,
    actualResult: JSON.stringify(actualResult).slice(0, 80),
    status: passed ? 'PASS' : 'FAIL',
  });
  return passed;
}

async function run() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('   CAMPUS BUS PASS — DRIVER BACKEND API TEST SUITE (30 TESTS)  ');
  console.log('════════════════════════════════════════════════════════════════\n');

  await connectDB();
  server = app.listen(PORT);

  // Clean up any test fixtures from previous runs
  const testEmails = ['driver@test.com', 'driver2@test.com', 'student.test@gsfc.edu', 'student.other@gsfc.edu', 'admin.test@gsfc.edu'];
  await Driver.deleteMany({ email: { $in: testEmails } });
  await Driver.deleteMany({ licenseNumber: { $in: ['GJ-DL-9999', 'GJ-DL-8888', 'GJ-DL-7777'] } });
  await Student.deleteMany({ collegeEmail: { $in: testEmails } });
  await Admin.deleteMany({ email: { $in: testEmails } });
  await Bus.deleteMany({ busNumber: { $in: ['TEST-BUS-01', 'TEST-BUS-02'] } });
  await Route.deleteMany({ routeCode: { $in: ['TEST-R01', 'TEST-R02'] } });
  await BusAssignment.deleteMany({ busPassId: { $in: [validBusPassId, otherBusPassId, 'GSFC-DRV-003'] } });
  await Attendance.deleteMany({ busPassId: { $in: [validBusPassId, otherBusPassId] } });

  // ── TEST 1: REGISTER DRIVER ──────────────────────────────────────────────────
  console.log('── 01 REGISTER DRIVER');
  const regBody = {
    name: 'Test Driver',
    email: 'driver@test.com',
    phone: '9876543210',
    licenseNumber: 'GJ-DL-9999',
    password: 'Driver@123',
  };
  let r = await req('POST', `${BASE}/drivers/register`, regBody);
  recordTest({
    id: 1,
    name: 'Register Driver',
    api: '/api/drivers/register',
    method: 'POST',
    url: `${BASE}/drivers/register`,
    input: regBody,
    expectedStatus: 201,
    actualStatus: r.status,
    expectedResult: 'Driver registered successfully without returning password',
    actualResult: r.data,
    passed: r.status === 201 && r.data.success === true && r.data.data?._id && !r.data.data?.password,
  });
  testDriverId = r.data.data?._id;

  // ── TEST 2: DUPLICATE EMAIL ──────────────────────────────────────────────────
  console.log('\n── 02 DUPLICATE EMAIL');
  const dupEmailBody = {
    name: 'Another Driver',
    email: 'driver@test.com',
    phone: '9123456780',
    licenseNumber: 'GJ-DL-8888',
    password: 'Driver@123',
  };
  r = await req('POST', `${BASE}/drivers/register`, dupEmailBody);
  recordTest({
    id: 2,
    name: 'Duplicate Email Registration',
    api: '/api/drivers/register',
    method: 'POST',
    url: `${BASE}/drivers/register`,
    input: dupEmailBody,
    expectedStatus: 409,
    actualStatus: r.status,
    expectedResult: '409 Conflict',
    actualResult: r.data,
    passed: r.status === 409 && r.data.success === false,
  });

  // ── TEST 3: DUPLICATE LICENSE ────────────────────────────────────────────────
  console.log('\n── 03 DUPLICATE LICENSE');
  const dupLicenseBody = {
    name: 'Another Driver 2',
    email: 'driver2@test.com',
    phone: '9123456781',
    licenseNumber: 'GJ-DL-9999',
    password: 'Driver@123',
  };
  r = await req('POST', `${BASE}/drivers/register`, dupLicenseBody);
  recordTest({
    id: 3,
    name: 'Duplicate License Registration',
    api: '/api/drivers/register',
    method: 'POST',
    url: `${BASE}/drivers/register`,
    input: dupLicenseBody,
    expectedStatus: 409,
    actualStatus: r.status,
    expectedResult: '409 Conflict',
    actualResult: r.data,
    passed: r.status === 409 && r.data.success === false,
  });

  // ── TEST 4: INVALID EMAIL ────────────────────────────────────────────────────
  console.log('\n── 04 INVALID EMAIL');
  const invEmailBody = {
    name: 'Invalid Email Driver',
    email: 'invalid-email-format',
    phone: '9123456782',
    licenseNumber: 'GJ-DL-7777',
    password: 'Driver@123',
  };
  r = await req('POST', `${BASE}/drivers/register`, invEmailBody);
  recordTest({
    id: 4,
    name: 'Invalid Email Registration',
    api: '/api/drivers/register',
    method: 'POST',
    url: `${BASE}/drivers/register`,
    input: invEmailBody,
    expectedStatus: 400,
    actualStatus: r.status,
    expectedResult: '400 Bad Request',
    actualResult: r.data,
    passed: r.status === 400 && r.data.success === false,
  });

  // ── TEST 5: LOGIN ────────────────────────────────────────────────────────────
  console.log('\n── 05 DRIVER LOGIN');
  const loginBody = {
    email: 'driver@test.com',
    password: 'Driver@123',
    role: 'driver',
  };
  r = await req('POST', `${BASE}/auth/login`, loginBody);
  const tokenFound = r.data?.token || r.data?.data?.token;
  if (tokenFound) driverToken = tokenFound;
  recordTest({
    id: 5,
    name: 'Driver Login',
    api: '/api/auth/login',
    method: 'POST',
    url: `${BASE}/auth/login`,
    input: loginBody,
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + JWT Token',
    actualResult: { success: r.data.success, hasToken: Boolean(tokenFound) },
    passed: r.status === 200 && Boolean(tokenFound),
  });

  // ── TEST 6: WRONG PASSWORD ───────────────────────────────────────────────────
  console.log('\n── 06 WRONG PASSWORD');
  r = await req('POST', `${BASE}/auth/login`, {
    email: 'driver@test.com',
    password: 'WrongPassword@123',
    role: 'driver',
  });
  recordTest({
    id: 6,
    name: 'Login with Wrong Password',
    api: '/api/auth/login',
    method: 'POST',
    url: `${BASE}/auth/login`,
    input: { email: 'driver@test.com', password: '***' },
    expectedStatus: 401,
    actualStatus: r.status,
    expectedResult: '401 Unauthorized',
    actualResult: r.data,
    passed: r.status === 401 && r.data.success === false,
  });

  // ── TEST 7: PROFILE WITHOUT TOKEN ───────────────────────────────────────────
  console.log('\n── 07 PROFILE WITHOUT TOKEN');
  r = await req('GET', `${BASE}/drivers/profile`);
  recordTest({
    id: 7,
    name: 'Get Profile Without Token',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: {},
    expectedStatus: 401,
    actualStatus: r.status,
    expectedResult: '401 Unauthorized',
    actualResult: r.data,
    passed: r.status === 401 && r.data.success === false,
  });

  // ── TEST 8: PROFILE WITH DRIVER TOKEN ───────────────────────────────────────
  console.log('\n── 08 PROFILE WITH DRIVER TOKEN');
  r = await req('GET', `${BASE}/drivers/profile`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 8,
    name: 'Get Profile with Driver Token',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK without password field',
    actualResult: r.data,
    passed: r.status === 200 && r.data.success === true && r.data.data?.email === 'driver@test.com' && !r.data.data?.password,
  });

  // Setup auxiliary accounts for student and admin to test role authorization
  const student = new Student({
    name: 'Test Student',
    studentId: 'STU-TEST-001',
    collegeEmail: 'student.test@gsfc.edu',
    phone: '9876543211',
    department: 'CSE',
    semester: 3,
    password: 'Student@123',
    isVerified: true,
    transportStatus: 'approved',
  });
  await student.save();
  testStudentId = student._id;

  const admin = new Admin({
    name: 'Test Admin',
    email: 'admin.test@gsfc.edu',
    phone: '9876543212',
    employeeId: 'ADM-TEST-001',
    password: 'Admin@123',
    isVerified: true,
  });
  await admin.save();

  studentToken = jwt.sign({ id: String(student._id), role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: String(admin._id), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // ── TEST 9: STUDENT TOKEN ON DRIVER ROUTE ────────────────────────────────────
  console.log('\n── 09 STUDENT TOKEN ON DRIVER ROUTE');
  r = await req('GET', `${BASE}/drivers/profile`, null, { Authorization: `Bearer ${studentToken}` });
  recordTest({
    id: 9,
    name: 'Student Token on Driver Route',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: { Authorization: 'Bearer student_token' },
    expectedStatus: 403,
    actualStatus: r.status,
    expectedResult: '403 Forbidden',
    actualResult: r.data,
    passed: r.status === 403 && r.data.success === false,
  });

  // ── TEST 10: ADMIN TOKEN ON DRIVER ROUTE ─────────────────────────────────────
  console.log('\n── 10 ADMIN TOKEN ON DRIVER ROUTE');
  r = await req('GET', `${BASE}/drivers/profile`, null, { Authorization: `Bearer ${adminToken}` });
  recordTest({
    id: 10,
    name: 'Admin Token on Driver Route',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: { Authorization: 'Bearer admin_token' },
    expectedStatus: 403,
    actualStatus: r.status,
    expectedResult: '403 Forbidden',
    actualResult: r.data,
    passed: r.status === 403 && r.data.success === false,
  });

  // ── TEST 11: GET ASSIGNED BUS BEFORE ASSIGNMENT ───────────────────────────────
  console.log('\n── 11 GET ASSIGNED BUS BEFORE ASSIGNMENT');
  r = await req('GET', `${BASE}/drivers/assigned-bus`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 11,
    name: 'Get Assigned Bus Before Assignment',
    api: '/api/drivers/assigned-bus',
    method: 'GET',
    url: `${BASE}/drivers/assigned-bus`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 404,
    actualStatus: r.status,
    expectedResult: '404 No bus assigned',
    actualResult: r.data,
    passed: r.status === 404 && r.data.success === false,
  });

  // ── SETUP BUS, ROUTE, PICKUP POINTS AND ASSIGNMENTS ─────────────────────────
  const bus1 = new Bus({
    busNumber: 'TEST-BUS-01',
    registrationNumber: 'GJ-06-AB-1111',
    capacity: 40,
    busType: 'university',
    status: 'active',
    assignedDriver: testDriverId,
  });
  await bus1.save();
  testBusId = bus1._id;

  const bus2 = new Bus({
    busNumber: 'TEST-BUS-02',
    registrationNumber: 'GJ-06-AB-2222',
    capacity: 40,
    busType: 'university',
    status: 'active',
  });
  await bus2.save();
  testOtherBusId = bus2._id;

  const route1 = new Route({
    routeName: 'Route Alpha',
    routeCode: 'TEST-R01',
    startPoint: 'Station',
    endPoint: 'Campus',
    timings: '08:00 AM - 09:00 AM',
    status: 'active',
    assignedBus: bus1._id,
    assignedDriver: testDriverId,
  });
  await route1.save();
  testRouteId = route1._id;

  const pickup1 = new PickupPoint({
    name: 'Central Mall Stop',
    location: 'Central Mall',
    route: route1._id,
    sequence: 1,
    pickupTime: '08:15',
    status: 'active',
  });
  await pickup1.save();
  testPickupPointId = pickup1._id;

  route1.pickupPoints.push(pickup1._id);
  await route1.save();

  // Update driver document with references
  await Driver.findByIdAndUpdate(testDriverId, {
    assignedBus: bus1._id,
    assignedRoute: route1._id,
  });

  // Assign Student 1 to Driver's Bus 1
  const assignment1 = new BusAssignment({
    student: testStudentId,
    bus: bus1._id,
    route: route1._id,
    pickupPoint: pickup1._id,
    busPassId: validBusPassId,
    assignedBy: admin._id,
    status: 'active',
  });
  await assignment1.save();

  // Create Student 2 and assign to Other Bus 2
  const otherStudent = new Student({
    name: 'Other Bus Student',
    studentId: 'STU-TEST-002',
    collegeEmail: 'student.other@gsfc.edu',
    phone: '9876543213',
    department: 'IT',
    semester: 4,
    password: 'Student@123',
    isVerified: true,
    transportStatus: 'approved',
  });
  await otherStudent.save();
  testOtherStudentId = otherStudent._id;

  const assignment2 = new BusAssignment({
    student: otherStudent._id,
    bus: bus2._id,
    route: route1._id,
    pickupPoint: pickup1._id,
    busPassId: otherBusPassId,
    assignedBy: admin._id,
    status: 'active',
  });
  await assignment2.save();

  // ── TEST 12: GET ASSIGNED BUS ────────────────────────────────────────────────
  console.log('\n── 12 GET ASSIGNED BUS (AFTER ASSIGNMENT)');
  r = await req('GET', `${BASE}/drivers/assigned-bus`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 12,
    name: 'Get Assigned Bus',
    api: '/api/drivers/assigned-bus',
    method: 'GET',
    url: `${BASE}/drivers/assigned-bus`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + Bus Details',
    actualResult: r.data,
    passed: r.status === 200 && r.data.success === true && r.data.data?.busNumber === 'TEST-BUS-01',
  });

  // ── TEST 13: GET ASSIGNED ROUTE ──────────────────────────────────────────────
  console.log('\n── 13 GET ASSIGNED ROUTE');
  r = await req('GET', `${BASE}/drivers/assigned-route`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 13,
    name: 'Get Assigned Route',
    api: '/api/drivers/assigned-route',
    method: 'GET',
    url: `${BASE}/drivers/assigned-route`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + Route Details',
    actualResult: r.data,
    passed: r.status === 200 && r.data.success === true && r.data.data?.routeCode === 'TEST-R01',
  });

  // ── TEST 14: GET PICKUP POINTS ───────────────────────────────────────────────
  console.log('\n── 14 GET PICKUP POINTS');
  r = await req('GET', `${BASE}/drivers/pickup-points`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 14,
    name: 'Get Pickup Points for Assigned Route',
    api: '/api/drivers/pickup-points',
    method: 'GET',
    url: `${BASE}/drivers/pickup-points`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + Array of pickup points',
    actualResult: r.data,
    passed: r.status === 200 && r.data.success === true && Array.isArray(r.data.data) && r.data.data.length >= 1,
  });

  // ── TEST 15: GET ASSIGNED STUDENTS ───────────────────────────────────────────
  console.log('\n── 15 GET ASSIGNED STUDENTS');
  r = await req('GET', `${BASE}/drivers/students`, null, { Authorization: `Bearer ${driverToken}` });
  const studentsList = Array.isArray(r.data.data) ? r.data.data : [];
  const onlyBus1Students = studentsList.every(s => !s.bus || s.bus.busNumber === 'TEST-BUS-01');
  recordTest({
    id: 15,
    name: 'Get Assigned Students',
    api: '/api/drivers/students',
    method: 'GET',
    url: `${BASE}/drivers/students`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + only students assigned to Driver Bus',
    actualResult: { count: studentsList.length, onlyBus1: onlyBus1Students },
    passed: r.status === 200 && r.data.success === true && studentsList.length === 1 && onlyBus1Students,
  });

  // ── TEST 16: VERIFY VALID BUS PASS ───────────────────────────────────────────
  console.log('\n── 16 VERIFY VALID BUS PASS');
  r = await req('POST', `${BASE}/drivers/verify-bus-pass`, { busPassId: validBusPassId }, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 16,
    name: 'Verify Valid Bus Pass',
    api: '/api/drivers/verify-bus-pass',
    method: 'POST',
    url: `${BASE}/drivers/verify-bus-pass`,
    headers: { Authorization: 'Bearer driver_token' },
    input: { busPassId: validBusPassId },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + Student Details',
    actualResult: r.data,
    passed: r.status === 200 && r.data.success === true && r.data.data?.student?.name === 'Test Student' && r.data.data?.busPassId === validBusPassId,
  });

  // ── TEST 17: INVALID BUS PASS ────────────────────────────────────────────────
  console.log('\n── 17 INVALID BUS PASS');
  r = await req('POST', `${BASE}/drivers/verify-bus-pass`, { busPassId: 'INVALID-PASS-999' }, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 17,
    name: 'Verify Non-Existent Bus Pass',
    api: '/api/drivers/verify-bus-pass',
    method: 'POST',
    url: `${BASE}/drivers/verify-bus-pass`,
    headers: { Authorization: 'Bearer driver_token' },
    input: { busPassId: 'INVALID-PASS-999' },
    expectedStatus: 404,
    actualStatus: r.status,
    expectedResult: '404 Bus pass not found',
    actualResult: r.data,
    passed: r.status === 404 && r.data.success === false,
  });

  // ── TEST 18: OTHER BUS STUDENT VERIFICATION ──────────────────────────────────
  console.log('\n── 18 OTHER BUS STUDENT VERIFICATION');
  r = await req('POST', `${BASE}/drivers/verify-bus-pass`, { busPassId: otherBusPassId }, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 18,
    name: 'Verify Other Bus Student Pass',
    api: '/api/drivers/verify-bus-pass',
    method: 'POST',
    url: `${BASE}/drivers/verify-bus-pass`,
    headers: { Authorization: 'Bearer driver_token' },
    input: { busPassId: otherBusPassId },
    expectedStatus: 403,
    actualStatus: r.status,
    expectedResult: '403 Student is not assigned to your bus',
    actualResult: r.data,
    passed: r.status === 403 && r.data.success === false,
  });

  // ── TEST 19: MARK ATTENDANCE ─────────────────────────────────────────────────
  console.log('\n── 19 MARK ATTENDANCE');
  const attBody = { busPassId: validBusPassId, status: 'present' };
  r = await req('POST', `${BASE}/drivers/attendance`, attBody, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 19,
    name: 'Mark Attendance',
    api: '/api/drivers/attendance',
    method: 'POST',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    input: attBody,
    expectedStatus: 201,
    actualStatus: r.status,
    expectedResult: '201 Attendance marked successfully',
    actualResult: r.data,
    passed: r.status === 201 && r.data.success === true && r.data.data?.status === 'present',
  });

  // ── TEST 20: DUPLICATE ATTENDANCE ────────────────────────────────────────────
  console.log('\n── 20 DUPLICATE ATTENDANCE');
  r = await req('POST', `${BASE}/drivers/attendance`, attBody, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 20,
    name: 'Duplicate Attendance Same Day',
    api: '/api/drivers/attendance',
    method: 'POST',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    input: attBody,
    expectedStatus: 409,
    actualStatus: r.status,
    expectedResult: '409 Attendance already marked for this student today',
    actualResult: r.data,
    passed: r.status === 409 && r.data.success === false,
  });

  // ── TEST 21: ATTENDANCE FOR OTHER BUS STUDENT ────────────────────────────────
  console.log('\n── 21 ATTENDANCE FOR OTHER BUS STUDENT');
  r = await req('POST', `${BASE}/drivers/attendance`, { busPassId: otherBusPassId, status: 'present' }, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 21,
    name: 'Attendance for Other Bus Student',
    api: '/api/drivers/attendance',
    method: 'POST',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    input: { busPassId: otherBusPassId, status: 'present' },
    expectedStatus: 403,
    actualStatus: r.status,
    expectedResult: '403 Student is not assigned to your bus',
    actualResult: r.data,
    passed: r.status === 403 && r.data.success === false,
  });

  // ── TEST 22: MISSING BUS PASS ────────────────────────────────────────────────
  console.log('\n── 22 MISSING BUS PASS');
  r = await req('POST', `${BASE}/drivers/attendance`, {}, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 22,
    name: 'Mark Attendance Missing Pass ID',
    api: '/api/drivers/attendance',
    method: 'POST',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    input: {},
    expectedStatus: 400,
    actualStatus: r.status,
    expectedResult: '400 Bad Request',
    actualResult: r.data,
    passed: r.status === 400 && r.data.success === false,
  });

  // ── TEST 23: INVALID STATUS ──────────────────────────────────────────────────
  console.log('\n── 23 INVALID STATUS');
  r = await req('POST', `${BASE}/drivers/attendance`, { busPassId: validBusPassId, status: 'random' }, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 23,
    name: 'Mark Attendance Invalid Status',
    api: '/api/drivers/attendance',
    method: 'POST',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    input: { busPassId: validBusPassId, status: 'random' },
    expectedStatus: 400,
    actualStatus: r.status,
    expectedResult: '400 Invalid status',
    actualResult: r.data,
    passed: r.status === 400 && r.data.success === false,
  });

  // ── TEST 24: TODAY'S ATTENDANCE ──────────────────────────────────────────────
  console.log('\n── 24 TODAY\'S ATTENDANCE');
  r = await req('GET', `${BASE}/drivers/attendance/today`, null, { Authorization: `Bearer ${driverToken}` });
  const todayList = Array.isArray(r.data.data) ? r.data.data : [];
  const foundRecorded = todayList.some(item => item.busPassId === validBusPassId);
  recordTest({
    id: 24,
    name: 'Get Today\'s Attendance',
    api: '/api/drivers/attendance/today',
    method: 'GET',
    url: `${BASE}/drivers/attendance/today`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + newly marked student present',
    actualResult: { count: todayList.length, found: foundRecorded },
    passed: r.status === 200 && r.data.success === true && foundRecorded,
  });

  // ── TEST 25: ATTENDANCE HISTORY ──────────────────────────────────────────────
  console.log('\n── 25 ATTENDANCE HISTORY');
  r = await req('GET', `${BASE}/drivers/attendance`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 25,
    name: 'Get Attendance History',
    api: '/api/drivers/attendance',
    method: 'GET',
    url: `${BASE}/drivers/attendance`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK',
    actualResult: { count: Array.isArray(r.data.data) ? r.data.data.length : 0 },
    passed: r.status === 200 && r.data.success === true && Array.isArray(r.data.data) && r.data.data.length >= 1,
  });

  // ── TEST 26: ATTENDANCE MONTH FILTER ─────────────────────────────────────────
  console.log('\n── 26 ATTENDANCE MONTH FILTER');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  r = await req('GET', `${BASE}/drivers/attendance?month=${currentMonth}&year=${currentYear}`, null, { Authorization: `Bearer ${driverToken}` });
  recordTest({
    id: 26,
    name: 'Attendance Filter by Month and Year',
    api: '/api/drivers/attendance?month=...&year=...',
    method: 'GET',
    url: `${BASE}/drivers/attendance?month=${currentMonth}&year=${currentYear}`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK',
    actualResult: { count: Array.isArray(r.data.data) ? r.data.data.length : 0 },
    passed: r.status === 200 && r.data.success === true && Array.isArray(r.data.data),
  });

  // ── TEST 27: SEARCH STUDENTS ─────────────────────────────────────────────────
  console.log('\n── 27 SEARCH STUDENTS');
  r = await req('GET', `${BASE}/drivers/students?search=Test`, null, { Authorization: `Bearer ${driverToken}` });
  const searchResults = Array.isArray(r.data.data) ? r.data.data : [];
  recordTest({
    id: 27,
    name: 'Search Students by Name',
    api: '/api/drivers/students?search=Test',
    method: 'GET',
    url: `${BASE}/drivers/students?search=Test`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK with filtered results',
    actualResult: { count: searchResults.length },
    passed: r.status === 200 && r.data.success === true && searchResults.length === 1 && searchResults[0].student.name === 'Test Student',
  });

  // ── TEST 28: PAGINATION ──────────────────────────────────────────────────────
  console.log('\n── 28 PAGINATION');
  r = await req('GET', `${BASE}/drivers/students?page=1&limit=5`, null, { Authorization: `Bearer ${driverToken}` });
  const paginatedList = Array.isArray(r.data.data) ? r.data.data : [];
  recordTest({
    id: 28,
    name: 'Pagination Limit',
    api: '/api/drivers/students?page=1&limit=5',
    method: 'GET',
    url: `${BASE}/drivers/students?page=1&limit=5`,
    headers: { Authorization: 'Bearer driver_token' },
    expectedStatus: 200,
    actualStatus: r.status,
    expectedResult: '200 OK + maximum 5 records',
    actualResult: { count: paginatedList.length },
    passed: r.status === 200 && r.data.success === true && paginatedList.length <= 5,
  });

  // ── TEST 29: INVALID TOKEN ───────────────────────────────────────────────────
  console.log('\n── 29 INVALID TOKEN');
  r = await req('GET', `${BASE}/drivers/profile`, null, { Authorization: 'Bearer invalid-token-xyz' });
  recordTest({
    id: 29,
    name: 'Invalid Token Authorization',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: { Authorization: 'Bearer invalid-token-xyz' },
    expectedStatus: 401,
    actualStatus: r.status,
    expectedResult: '401 Unauthorized',
    actualResult: r.data,
    passed: r.status === 401 && r.data.success === false,
  });

  // ── TEST 30: EXPIRED TOKEN ───────────────────────────────────────────────────
  console.log('\n── 30 EXPIRED TOKEN');
  const expiredToken = jwt.sign({ id: String(testDriverId), role: 'driver' }, process.env.JWT_SECRET, { expiresIn: -10 });
  r = await req('GET', `${BASE}/drivers/profile`, null, { Authorization: `Bearer ${expiredToken}` });
  recordTest({
    id: 30,
    name: 'Expired Token Authorization',
    api: '/api/drivers/profile',
    method: 'GET',
    url: `${BASE}/drivers/profile`,
    headers: { Authorization: 'Bearer expired_token' },
    expectedStatus: 401,
    actualStatus: r.status,
    expectedResult: '401 Unauthorized',
    actualResult: r.data,
    passed: r.status === 401 && r.data.success === false,
  });

  // ── COMPLETE CROSS-MODULE INTEGRATION FLOW ────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('   COMPLETE INTEGRATION FLOW (STUDENT -> ADMIN -> DRIVER)');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Verify Student module can see the attendance marked by Driver
  const studentAttRes = await req('GET', `${BASE}/students/attendance`, null, { Authorization: `Bearer ${studentToken}` });
  const studentSawAttendance = studentAttRes.status === 200 && Array.isArray(studentAttRes.data.data) && studentAttRes.data.data.some(a => a.busPassId === validBusPassId);
  console.log(`  ${studentSawAttendance ? '✅ PASS' : '❌ FAIL'} Student attendance API reflects marked record (Status: ${studentAttRes.status})`);

  // Verify Admin module can see the attendance record
  const adminAttRes = await req('GET', `${BASE}/admin/attendance`, null, { Authorization: `Bearer ${adminToken}` });
  const adminSawAttendance = adminAttRes.status === 200 && Array.isArray(adminAttRes.data.data) && adminAttRes.data.data.some(a => a.busPassId === validBusPassId);
  console.log(`  ${adminSawAttendance ? '✅ PASS' : '❌ FAIL'} Admin attendance API reflects marked record (Status: ${adminAttRes.status})`);

  // Verify Admin attendance report
  const adminReportRes = await req('GET', `${BASE}/admin/reports?type=daily`, null, { Authorization: `Bearer ${adminToken}` });
  const adminReportOk = adminReportRes.status === 200 && adminReportRes.data.success === true;
  console.log(`  ${adminReportOk ? '✅ PASS' : '❌ FAIL'} Admin report API includes attendance data (Status: ${adminReportRes.status})`);

  // Print Summary Table
  console.log('\n════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('                                                  FINAL TEST REPORT');
  console.log('════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('| Test ID | Method | API Endpoint                         | Expected | Actual | Status |');
  console.log('|---------|--------|--------------------------------------|----------|--------|--------|');
  for (const t of results) {
    const padId = String(t.id).padEnd(7);
    const padMethod = t.method.padEnd(6);
    const padApi = t.api.slice(0, 36).padEnd(36);
    const padExp = String(t.expectedStatus).padEnd(8);
    const padAct = String(t.actualStatus).padEnd(6);
    const padStatus = t.status.padEnd(6);
    console.log(`| ${padId} | ${padMethod} | ${padApi} | ${padExp} | ${padAct} | ${padStatus} |`);
  }
  console.log('════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);

  // Cleanup test artifacts
  await Driver.deleteMany({ email: { $in: testEmails } });
  await Driver.deleteMany({ licenseNumber: { $in: ['GJ-DL-9999', 'GJ-DL-8888', 'GJ-DL-7777'] } });
  await Student.deleteMany({ collegeEmail: { $in: testEmails } });
  await Admin.deleteMany({ email: { $in: testEmails } });
  await Bus.deleteMany({ busNumber: { $in: ['TEST-BUS-01', 'TEST-BUS-02'] } });
  await Route.deleteMany({ routeCode: { $in: ['TEST-R01', 'TEST-R02'] } });
  await PickupPoint.deleteMany({ _id: testPickupPointId });
  await BusAssignment.deleteMany({ busPassId: { $in: [validBusPassId, otherBusPassId] } });
  await Attendance.deleteMany({ busPassId: { $in: [validBusPassId, otherBusPassId] } });

  server.close();
  await mongoose.disconnect();

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Test execution error:', err);
  if (server) server.close();
  mongoose.disconnect();
  process.exit(1);
});
