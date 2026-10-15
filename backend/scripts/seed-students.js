'use strict';
/**
 * Seed 5 student accounts + submit transport requests for them
 * Run: node scripts/seed-students.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const mongoose = require('mongoose');
const Student = require('../database/models/Student');
const TransportRequest = require('../database/models/TransportRequest');
const PickupPoint = require('../database/models/PickupPoint');

const BASE = 'http://localhost:5000/api';

const STUDENTS = [
  {
    name: 'Tirth Gandhi',
    studentId: '25BT04D240',
    collegeEmail: 'tirth.gandhi@gsfc.edu',
    phone: '9876543210',
    department: 'Computer Science',
    semester: 5,
    password: 'Tirth@1234',
  },
  {
    name: 'Priya Mehta',
    studentId: '25BT04D241',
    collegeEmail: 'priya.mehta@gsfc.edu',
    phone: '9823456781',
    department: 'Information Technology',
    semester: 3,
    password: 'Priya@1234',
  },
  {
    name: 'Arjun Shah',
    studentId: '25BT04D242',
    collegeEmail: 'arjun.shah@gsfc.edu',
    phone: '9712345672',
    department: 'Electronics & Communication',
    semester: 7,
    password: 'Arjun@1234',
  },
  {
    name: 'Neha Joshi',
    studentId: '25BT04D243',
    collegeEmail: 'neha.joshi@gsfc.edu',
    phone: '9601234563',
    department: 'Mechanical Engineering',
    semester: 2,
    password: 'Neha@1234',
  },
  {
    name: 'Rohan Patel',
    studentId: '25BT04D244',
    collegeEmail: 'rohan.patel@gsfc.edu',
    phone: '9500123454',
    department: 'Civil Engineering',
    semester: 6,
    password: 'Rohan@1234',
  },
];

async function apiPost(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + url, { method: 'POST', headers, body: JSON.stringify(body) });
  return res.json();
}

async function apiGet(url, token) {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(BASE + url, { headers });
  return res.json();
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  SEEDING 5 STUDENTS — FULL STACK TEST');
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.connect(process.env.MONGO_URI);

  // Clean existing test students
  const emails = STUDENTS.map(s => s.collegeEmail);
  const ids = STUDENTS.map(s => s.studentId);
  const cleaned = await Student.deleteMany({
    $or: [{ collegeEmail: { $in: emails } }, { studentId: { $in: ids } }],
  });
  if (cleaned.deletedCount) console.log(`🧹 Cleaned ${cleaned.deletedCount} existing test student(s)\n`);

  // Get the first active pickup point for request seeding
  const pickupPoint = await PickupPoint.findOne({ status: 'active' });
  if (!pickupPoint) {
    console.log('⚠  No active pickup point found in DB. Requests will not be submitted.');
    console.log('   Run the seed-pickup script or add a pickup point via the admin module.\n');
  }

  await mongoose.disconnect();

  const results = [];

  for (const student of STUDENTS) {
    console.log(`\n── ${student.name} (${student.studentId})`);

    // 1. Register
    let res = await apiPost('/students/register', { ...student, role: 'student' });
    if (res.success) {
      console.log(`  ✅ Registered → ${res.data._id}`);
    } else {
      console.log(`  ❌ Register failed: ${res.message}`);
      continue;
    }

    // 2. Login
    res = await apiPost('/auth/login', {
      email: student.collegeEmail,
      password: student.password,
      role: 'student',
    });
    if (!res.success || !res.data?.token) {
      console.log(`  ❌ Login failed: ${res.message}`);
      continue;
    }
    const token = res.data.token;
    console.log(`  ✅ Logged in → token: ${token.substring(0, 20)}...`);

    // 3. Get Profile
    const profile = await apiGet('/students/profile', token);
    console.log(`  ✅ Profile → name: ${profile.data?.name}, dept: ${profile.data?.department}, semester: ${profile.data?.semester}`);
    if ('password' in (profile.data || {})) console.log('  ❌ PASSWORD EXPOSED');

    // 4. Dashboard (before request)
    const dash = await apiGet('/students/dashboard', token);
    console.log(`  ✅ Dashboard → requestStatus: ${dash.data?.transportRequest ?? 'null'}, attendance: ${JSON.stringify(dash.data?.attendance)}`);

    // 5. Submit Transport Request
    if (pickupPoint) {
      const tr = await apiPost('/students/transport-request', { pickupPointId: String(pickupPoint._id) }, token);
      if (tr.success) {
        console.log(`  ✅ Transport request → status: ${tr.data?.status}, pickup: ${pickupPoint.name}`);
      } else {
        console.log(`  ⚠  Request: ${tr.message}`);
      }
    }

    // 6. Get Request Status
    const req = await apiGet('/students/transport-request', token);
    if (req.success) {
      console.log(`  ✅ Request status → ${req.data?.status} | rejection: ${req.data?.rejectionReason ?? 'none'}`);
    }

    results.push({ name: student.name, email: student.collegeEmail, password: student.password });
  }

  // Final Atlas verification
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  MONGODB ATLAS VERIFICATION');
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.connect(process.env.MONGO_URI);

  const allStudents = await Student.find({}).select('-password').sort({ createdAt: -1 });
  const allRequests = await TransportRequest.find({})
    .populate('student', 'name')
    .populate('pickupPoint', 'name')
    .sort({ createdAt: -1 });

  console.log(`📋 Total students in Atlas: ${allStudents.length}`);
  allStudents.slice(0, 5).forEach(s =>
    console.log(`   • ${s.name} | ${s.collegeEmail} | ${s.studentId} | transportStatus: ${s.transportStatus}`)
  );

  console.log(`\n📝 Total transport requests: ${allRequests.length}`);
  allRequests.slice(0, 5).forEach(r =>
    console.log(`   • ${r.student?.name} → ${r.pickupPoint?.name ?? 'unknown'} | status: ${r.status}`)
  );

  await mongoose.disconnect();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS FOR FRONTEND TESTING');
  console.log('═══════════════════════════════════════════════════');
  results.forEach(r => console.log(`  ${r.name.padEnd(18)} | ${r.email.padEnd(32)} | ${r.password}`));
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Seed error:', err.message); process.exit(1); });
