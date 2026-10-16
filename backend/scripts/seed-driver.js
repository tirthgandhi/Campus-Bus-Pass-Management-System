'use strict';

const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const mongoose = require('mongoose');
const Driver = require('../database/models/Driver');
const Bus = require('../database/models/Bus');
const Route = require('../database/models/Route');
const PickupPoint = require('../database/models/PickupPoint');
const Student = require('../database/models/Student');
const Admin = require('../database/models/Admin');
const BusAssignment = require('../database/models/BusAssignment');

async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI is required.');

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  // 1. Ensure Bus BUS-01 has all required fields
  let bus = await Bus.findOne({ busNumber: 'BUS-01' });
  if (bus) {
    await mongoose.connection.collection('buses').updateOne(
      { _id: bus._id },
      { $set: { registrationNumber: 'GJ06AB1234', capacity: 50, busType: 'university', status: 'active' } }
    );
    bus = await Bus.findById(bus._id);
  } else {
    bus = await Bus.create({
      busNumber: 'BUS-01',
      registrationNumber: 'GJ06AB1234',
      capacity: 50,
      busType: 'university',
      status: 'active',
    });
  }

  // 2. Ensure Route RT-01
  let route = await Route.findOne({ routeCode: 'RT-01' });
  if (!route) {
    route = await Route.create({
      routeName: 'Route Alpha (Station - Campus)',
      routeCode: 'RT-01',
      startPoint: 'Railway Station',
      endPoint: 'University Campus',
      timings: '07:30 AM - 08:30 AM',
      status: 'active',
      assignedBus: bus._id,
    });
  }

  // 3. Ensure Pickup Point
  let point = await PickupPoint.findOne({ route: route._id, name: 'Akota Circle' });
  if (!point) {
    point = await PickupPoint.create({
      name: 'Akota Circle',
      location: 'Akota Circle, Vadodara',
      landmark: 'Near Garden',
      sequence: 1,
      pickupTime: '07:45',
      route: route._id,
      status: 'active',
    });
    route.pickupPoints.push(point._id);
    await route.save();
  }

  // 4. Ensure Driver
  let driver = await Driver.findOne({ email: 'driver@college.edu' });
  if (!driver) {
    driver = new Driver({
      name: 'Rajesh Patel',
      email: 'driver@college.edu',
      phone: '9876543210',
      licenseNumber: 'GJ-DL-123456',
      password: 'Driver@123',
      status: 'active',
      isVerified: true,
      assignedBus: bus._id,
      assignedRoute: route._id,
    });
    await driver.save();
  } else {
    driver.name = 'Rajesh Patel';
    driver.password = 'Driver@123';
    driver.status = 'active';
    driver.isVerified = true;
    driver.assignedBus = bus._id;
    driver.assignedRoute = route._id;
    await driver.save();
  }

  // Associate bus and route with driver
  await mongoose.connection.collection('buses').updateOne(
    { _id: bus._id },
    { $set: { assignedDriver: driver._id, registrationNumber: 'GJ06AB1234' } }
  );
  await mongoose.connection.collection('routes').updateOne(
    { _id: route._id },
    { $set: { assignedDriver: driver._id, assignedBus: bus._id } }
  );

  // 5. Ensure Admin
  let admin = await Admin.findOne();
  if (!admin) {
    admin = await Admin.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      phone: '9998887770',
      employeeId: 'ADM001',
      password: 'Admin@123',
      isVerified: true,
    });
  }

  // 6. Ensure sample student & assignment
  let student = await Student.findOne({ studentId: '25BT04D240' });
  if (!student) {
    student = await Student.create({
      studentId: '25BT04D240',
      name: 'Tirth Gandhi',
      collegeEmail: 'tirth@gsfc.edu',
      phone: '9876543210',
      department: 'CSE',
      semester: 5,
      password: 'Student@123',
      isVerified: true,
      transportStatus: 'approved',
    });
  }

  let assignment = await BusAssignment.findOne({ busPassId: 'GSFC-01-001' });
  if (!assignment) {
    await BusAssignment.create({
      student: student._id,
      bus: bus._id,
      route: route._id,
      pickupPoint: point._id,
      busPassId: 'GSFC-01-001',
      assignedBy: admin._id,
      status: 'active',
    });
  }

  console.log('\n=========================================');
  console.log('  DRIVER ACCOUNT READY FOR LOGIN');
  console.log('=========================================');
  console.log('Role:     driver');
  console.log('Email:    ' + driver.email);
  console.log('Password: Driver@123');
  console.log('Name:     ' + driver.name);
  console.log('Bus:      ' + bus.busNumber + ' (' + (bus.registrationNumber || 'GJ06AB1234') + ')');
  console.log('Route:    ' + route.routeName);
  console.log('Student:  ' + student.name + ' (Pass ID: GSFC-01-001)');
  console.log('=========================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  mongoose.disconnect();
  process.exit(1);
});
