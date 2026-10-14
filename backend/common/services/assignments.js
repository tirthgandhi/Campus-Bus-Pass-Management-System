const mongoose = require('mongoose');
const Bus = require('../../database/models/Bus');
const Driver = require('../../database/models/Driver');
const Student = require('../../database/models/Student');
const Route = require('../../database/models/Route');
const PickupPoint = require('../../database/models/PickupPoint');
const TransportRequest = require('../../database/models/TransportRequest');
const BusAssignment = require('../../database/models/BusAssignment');
const { fail, found, id, sameId } = require('../utils/http');

async function allocate(body, adminId) {
  const studentId = id(body.studentId, 'student ID');
  const busId = id(body.busId, 'bus ID');
  const routeId = id(body.routeId, 'route ID');
  const pickupPointId = id(body.pickupPointId, 'pickup point ID');
  return mongoose.connection.transaction(async session => {
    const student = found(await Student.findById(studentId).session(session), 'Student');
    const bus = found(await Bus.findById(busId).session(session), 'Bus');
    const route = found(await Route.findById(routeId).session(session), 'Route');
    const pickup = found(await PickupPoint.findById(pickupPointId).session(session), 'Pickup point');
    if (student.transportStatus === 'inactive' || bus.status !== 'active' || route.status !== 'active' || pickup.status !== 'active') fail(409, 'Student, bus, route and pickup point must be available.');
    if (!sameId(pickup.route, route)) fail(400, 'Pickup point does not belong to this route.');
    if (!sameId(route.assignedBus, bus)) fail(400, 'Bus is not assigned to this route.');
    if (!(await TransportRequest.exists({ student: studentId, pickupPoint: pickupPointId, requestedRoute: routeId, status: 'approved' }).session(session))) fail(409, 'An approved transport request for this pickup point is required.');
    if (await BusAssignment.exists({ student: studentId, status: 'active' }).session(session)) fail(409, 'Student already has an active assignment.');
    // Writing the bus serializes concurrent allocations; transaction retries see fresh capacity.
    const reserved = await Bus.findByIdAndUpdate(busId, { $inc: { assignmentSequence: 1 } }, { returnDocument: 'after', session });
    const occupied = await BusAssignment.countDocuments({ bus: busId, status: 'active' }).session(session);
    if (occupied >= bus.capacity) fail(409, 'This bus has reached its capacity.');
    const busPassId = `GSFC-${bus.busNumber}-${String(reserved.assignmentSequence).padStart(3, '0')}`;
    const [assignment] = await BusAssignment.create([{ student: studentId, bus: busId, route: routeId, pickupPoint: pickupPointId, busPassId, assignedBy: adminId }], { session });
    student.transportStatus = 'approved';
    await student.save({ session });
    return assignment;
  });
}

async function assignDriver(busId, driverId, routeId) {
  id(busId, 'bus ID'); id(driverId, 'driver ID'); if (routeId) id(routeId, 'route ID');
  return mongoose.connection.transaction(async session => {
    const driver = found(await Driver.findById(driverId).session(session), 'Driver');
    const bus = found(await Bus.findById(busId).session(session), 'Bus');
    if (driver.status !== 'active' || bus.status !== 'active') fail(409, 'Driver and bus must be active.');
    if ((driver.assignedBus && !sameId(driver.assignedBus, bus)) || (bus.assignedDriver && !sameId(bus.assignedDriver, driver))) fail(409, 'Driver or bus already has an assignment.');
    if (routeId) {
      const route = found(await Route.findById(routeId).session(session), 'Route');
      if (route.status !== 'active') fail(409, 'Route must be active.');
      if ((driver.assignedRoute && !sameId(driver.assignedRoute, route)) || (route.assignedDriver && !sameId(route.assignedDriver, driver)) || (route.assignedBus && !sameId(route.assignedBus, bus))) fail(409, 'Driver, bus or route already has a different assignment.');
      driver.assignedRoute = route._id;
      route.assignedDriver = driver._id;
      route.assignedBus = bus._id;
      await route.save({ session });
    }
    driver.assignedBus = bus._id;
    bus.assignedDriver = driver._id;
    await driver.save({ session });
    await bus.save({ session });
    return driver;
  });
}
module.exports = { allocate, assignDriver };
