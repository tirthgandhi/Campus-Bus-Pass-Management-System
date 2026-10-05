/* Real API regression suite. Uses only a new, guarded, disposable MongoDB database.
 * node backend/tests/nine-model-integration.cjs
 * Add --serve to keep the disposable backend at :5000 for browser verification.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const backend = path.resolve(__dirname, '..');
for (const file of [path.join(backend, '.env'), path.join(backend, '..', '.env')]) {
  if (fs.existsSync(file)) for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(file)))) if (!process.env[key]) process.env[key] = value;
}
const database = `cbp_test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
const secret = crypto.randomBytes(48).toString('hex');
const password = 'Campus-Testing-2026!';
const serve = process.argv.includes('--serve');
process.env.JWT_SECRET = secret;
const app = require('../app');
const Student = require('../database/models/Student');
const Driver = require('../database/models/Driver');
const Admin = require('../database/models/Admin');
const BusAssignment = require('../database/models/BusAssignment');
let server, count = 0, connected = false;
let base;
function check(label, actual, expected) { assert.deepEqual(actual, expected, label); count++; console.log(`PASS ${label}`); }
function bounded(promise, ms = 20000) { let timer; return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Operation timed out')), ms); })]).finally(() => clearTimeout(timer)); }
async function request(url, { token, body, method = 'GET' } = {}) {
  const res = await fetch(`${base}${url}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  assert.equal(data.success, res.ok, `${method} ${url} uses a consistent envelope`);
  assert.doesNotMatch(JSON.stringify(data), /"password"|"emailVerificationToken"|"emailVerificationExpires"|"stack"|mongodb\+srv:/, 'Sensitive fields are absent');
  return { status: res.status, ...data };
}
async function close() {
  if (server) await new Promise(resolve => server.close(resolve));
  if (connected) {
    assert.match(database, /^cbp_test_\d+_[a-f0-9]{8}$/);
    assert.equal(mongoose.connection.name, database);
    await bounded(mongoose.connection.db.dropDatabase());
    console.log(`CLEANUP isolated database ${database} removed`);
  }
  await mongoose.disconnect();
}
async function main() {
  const uri = new URL(process.env.MONGO_URI || process.env.MONGODB_URI);
  if (uri.protocol === 'mongodb:' && !uri.searchParams.has('authSource')) uri.searchParams.set('authSource', decodeURIComponent(uri.pathname.slice(1)) || 'admin');
  uri.pathname = `/${database}`;
  await bounded(mongoose.connect(uri.toString(), { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 }));
  connected = true;
  check('isolated database connection', mongoose.connection.name, database);
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  check('exactly nine business models', mongoose.modelNames().sort(), ['Admin', 'Attendance', 'Bus', 'BusAssignment', 'Driver', 'PickupPoint', 'Route', 'Student', 'TransportRequest'].sort());
  const http = require('node:http');
  server = http.createServer((req, res) => {
    if (serve && req.method === 'POST' && req.url === '/__test/shutdown') {
      res.end('Stopping disposable test backend.');
      setImmediate(() => close().then(() => process.exit(0)).catch(() => process.exit(1)));
    } else app(req, res);
  });
  await new Promise(resolve => server.listen(serve ? 5000 : 0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const accountData = (role, index = 1) => ({ role, name: `Campus ${role} ${index}`, password, phone: '9876543210', ...(role === 'student' ? { studentId: `ENR${index}`, collegeEmail: `student${index}@campus.example`, department: 'Computer Engineering' } : { email: `driver${index}@campus.example`, licenseNumber: `DL${index}` }) });
  const accounts = {};
  for (const role of ['student', 'driver']) {
    const signup = await request('/api/auth/signup', { method: 'POST', body: accountData(role) });
    check(`${role} registration creates direct account`, signup.status, 201);
    check(`${role} registration role`, signup.data.role, role);
    accounts[role] = signup.data;
    const model = role === 'student' ? Student : Driver;
    const record = await model.findById(signup.data._id).select('+password');
    check(`${role} password hashed`, record.password.startsWith('$2'), true);
    check(`${role} bcrypt verification`, await record.matchPassword(password), true);
    const hash = record.password;
    record.name = `Updated ${record.name}`; await record.save();
    check(`${role} profile saves preserve hash`, record.password, hash);
    check(`${role} duplicate registration`, (await request('/api/auth/signup', { method: 'POST', body: accountData(role) })).status, 409);
    const duplicateId = { ...accountData(role), ...(role === 'student' ? { collegeEmail: 'other@campus.example' } : { email: 'other@campus.example' }) };
    check(`${role} duplicate identifier`, (await request('/api/auth/signup', { method: 'POST', body: duplicateId })).status, 409);
  }
  const admin = await Admin.create({ name: 'Campus admin', email: 'admin@campus.example', password });
  accounts.admin = { _id: String(admin._id), email: admin.email, role: 'admin' };
  check('public admin registration blocked', (await request('/api/auth/signup', { method: 'POST', body: { ...accountData('driver'), role: 'admin' } })).status, 403);
  check('extended admin registration blocked', (await request('/api/auth/register', { method: 'POST', body: { ...accountData('driver'), role: 'admin' } })).status, 403);
  check('invalid role rejected', (await request('/api/auth/login', { method: 'POST', body: { email: accounts.student.email, password, role: 'constructor' } })).status, 400);
  check('missing role rejected', (await request('/api/auth/login', { method: 'POST', body: { email: accounts.student.email, password } })).status, 400);
  check('query injection rejected', (await request('/api/auth/login', { method: 'POST', body: { email: { $ne: null }, password, role: 'student' } })).status, 400);
  check('missing token rejected', (await request('/api/auth/me')).status, 401);
  check('invalid token rejected', (await request('/api/auth/me', { token: 'invalid' })).status, 401);
  for (const [role, account] of Object.entries(accounts)) {
    const login = await request('/api/auth/login', { method: 'POST', body: { email: account.email, password, role } });
    check(`${role} login`, login.status, 200); account.token = login.data.token;
    const payload = jwt.verify(account.token, secret);
    check(`${role} JWT account ID`, payload.id, account._id);
    check(`${role} JWT role`, payload.role, role);
    const me = await request('/api/auth/me', { token: account.token });
    check(`${role} session restore identity`, me.data._id, account._id);
    for (const requiredRole of ['student', 'driver', 'admin']) check(`${role} authorization for ${requiredRole}`, (await request(`/api/auth/${requiredRole}-only`, { token: account.token })).status, role === requiredRole ? 200 : 403);
    check(`${role} invalid password`, (await request('/api/auth/login', { method: 'POST', body: { email: account.email, password: 'IncorrectPassword', role } })).status, 401);
  }
  check('old tokens without role rejected', (await request('/api/auth/me', { token: jwt.sign({ id: accounts.student._id }, secret) })).status, 401);
  check('expired JWT rejected', (await request('/api/auth/me', { token: jwt.sign({ id: accounts.student._id, role: 'student' }, secret, { expiresIn: -1 }) })).status, 401);
  check('invalid JWT role rejected', (await request('/api/auth/me', { token: jwt.sign({ id: accounts.student._id, role: 'owner' }, secret) })).status, 401);
  const asAdmin = (url, body, method = body ? 'POST' : 'GET') => request(`/api/admin${url}`, { token: accounts.admin.token, body, method });
  const asStudent = (url, body, method = body ? 'POST' : 'GET') => request(`/api/student${url}`, { token: accounts.student.token, body, method });
  const asDriver = (url, body, method = body ? 'POST' : 'GET') => request(`/api/driver${url}`, { token: accounts.driver.token, body, method });
  check('student profile', (await asStudent('/profile')).data.studentId, 'ENR1');
  check('profile update', (await asStudent('/profile', { phone: '9123456789', role: 'admin', transportStatus: 'approved' }, 'PUT')).data.phone, '9123456789');
  check('student cannot change transport status', (await asStudent('/profile')).data.transportStatus, 'pending');
  check('invalid phone rejected', (await asStudent('/profile', { phone: 'wrong' }, 'PUT')).status, 400);
  check('driver profile', (await asDriver('/profile')).data.licenseNumber, 'DL1');
  check('unassigned driver dashboard', (await asDriver('/dashboard')).data.assignedStudents, 0);
  check('empty student assignment', (await asStudent('/buspasses/my')).data, null);
  check('admin student listing', (await asAdmin('/students')).data.length, 1);
  check('admin driver listing', (await asAdmin('/drivers')).data.length, 1);
  check('invalid ObjectId', (await asAdmin('/buses/invalid')).status, 400);
  check('invalid bus capacity', (await asAdmin('/buses', { busNumber: 'X', registrationNumber: 'X', capacity: 0 })).status, 400);
  const bus = (await asAdmin('/buses', { busNumber: '01', registrationNumber: 'GJ-01-BUS', capacity: 1 })).data;
  check('bus read', (await asAdmin(`/buses/${bus._id}`)).data.capacity, 1);
  check('bus update', (await asAdmin(`/buses/${bus._id}`, { busType: 'hired' }, 'PUT')).data.busType, 'hired');
  const route = (await asAdmin('/routes', { routeName: 'Campus North', routeCode: 'N1', startPoint: 'North Gate', endPoint: 'Campus', assignedBus: bus._id })).data;
  check('route read', (await asAdmin(`/routes/${route._id}`)).status, 200);
  check('route update', (await asAdmin(`/routes/${route._id}`, { timings: '08:00' }, 'PUT')).data.timings, '08:00');
  const pickup = (await asAdmin('/pickup-points', { name: 'North Gate', location: 'Main Road', route: route._id, sequence: 1, pickupTime: '08:00' })).data;
  check('pickup point list for student', (await asStudent('/pickup-points')).data.length, 1);
  check('pickup point route relationship', (await asAdmin(`/routes/${route._id}`)).data.pickupPoints[0]._id, pickup._id);
  check('pickup point update', (await asAdmin(`/pickup-points/${pickup._id}`, { pickupTime: '08:10' }, 'PUT')).data.pickupTime, '08:10');
  check('driver assigned to bus and route', (await asAdmin(`/buses/${bus._id}/driver`, { driverId: accounts.driver._id, routeId: route._id }, 'PUT')).status, 200);
  check('driver bus view', (await asDriver('/bus')).data._id, bus._id);
  check('driver route view', (await asDriver('/route')).data._id, route._id);
  check('driver pickup points', (await asDriver('/route/pickup-points')).data.length, 1);
  const request1 = await asStudent('/passes', { pickupPoint: pickup._id });
  check('transport request creation', request1.status, 201);
  check('transport request owner', request1.data.student, accounts.student._id);
  check('transport request derives route', request1.data.requestedRoute, route._id);
  check('duplicate transport request blocked', (await asStudent('/passes', { pickupPoint: pickup._id })).status, 409);
  const allocateBody = { studentId: accounts.student._id, busId: bus._id, routeId: route._id, pickupPointId: pickup._id };
  check('unapproved allocation rejected', (await asAdmin('/students/allocate', allocateBody)).status, 409);
  check('pending request listing', (await asAdmin('/transport-requests/pending')).data.length, 1);
  check('request approval', (await asAdmin(`/transport-requests/${request1.data._id}/approve`, {}, 'PUT')).status, 200);
  check('review references direct admin', (await asStudent('/passes/my')).data[0].reviewedBy, accounts.admin._id);
  check('double review rejected', (await asAdmin(`/transport-requests/${request1.data._id}/reject`, { rejectionReason: 'Already reviewed' }, 'PUT')).status, 409);
  const assignment = await asAdmin('/students/allocate', allocateBody);
  check('assignment creation', assignment.status, 201);
  check('permanent pass generated', assignment.data.busPassId, 'GSFC-01-001');
  check('duplicate active assignment blocked', (await asAdmin('/students/allocate', allocateBody)).status, 409);
  check('student assignment and bus pass view', (await asStudent('/buspasses/my')).data.busPassId, assignment.data.busPassId);
  check('admin assignment listing', (await asAdmin('/assignments')).data.length, 1);
  check('driver assigned students', (await asDriver('/students')).data.length, 1);
  check('driver verifies pass', (await asDriver('/verify-bus-pass', { busPassId: assignment.data.busPassId })).data.student._id, accounts.student._id);
  check('invalid pass rejected', (await asDriver('/verify-bus-pass', { busPassId: 'GSFC-invalid' })).status, 404);
  const otherDriver = await request('/api/auth/signup', { method: 'POST', body: accountData('driver', 2) });
  check('other driver cannot verify pass', (await request('/api/driver/verify-bus-pass', { token: otherDriver.data.token, method: 'POST', body: { busPassId: assignment.data.busPassId } })).status, 404);
  const attendanceResults = await Promise.all([asDriver('/attendance', { busPassId: assignment.data.busPassId }), asDriver('/attendance', { busPassId: assignment.data.busPassId })]);
  check('concurrent duplicate attendance blocked', attendanceResults.map(result => result.status).sort(), [201, 409]);
  check('today attendance', (await asDriver('/attendance/today')).data.length, 1);
  check('student attendance', (await asStudent('/attendance')).data.length, 1);
  check('admin attendance', (await asAdmin('/attendance')).data[0].driver._id, accounts.driver._id);
  check('invalid date rejected', (await asAdmin('/attendance?date=2026-02-31')).status, 400);
  check('backdated attendance rejected', (await asDriver('/attendance', { busPassId: assignment.data.busPassId, date: '2000-01-01' })).status, 400);
  const secondStudent = await request('/api/auth/signup', { method: 'POST', body: accountData('student', 2) });
  const secondRequest = await request('/api/student/passes', { token: secondStudent.data.token, method: 'POST', body: { pickupPoint: pickup._id } });
  check('second student request', secondRequest.status, 201);
  check('request rejection requires reason', (await asAdmin(`/transport-requests/${secondRequest.data._id}/reject`, {}, 'PUT')).status, 400);
  check('request rejection', (await asAdmin(`/transport-requests/${secondRequest.data._id}/reject`, { rejectionReason: 'Please apply again' }, 'PUT')).data.rejectionReason, 'Please apply again');
  const retryRequest = await request('/api/student/passes', { token: secondStudent.data.token, method: 'POST', body: { pickupPoint: pickup._id } });
  check('new request after rejection', retryRequest.status, 201);
  await asAdmin(`/transport-requests/${retryRequest.data._id}/approve`, {}, 'PUT');
  check('bus capacity enforced', (await asAdmin('/students/allocate', { ...allocateBody, studentId: secondStudent.data._id })).status, 409);
  check('failed capacity allocation rolls back', await BusAssignment.countDocuments(), 1);
  const thirdStudent = await request('/api/auth/signup', { method: 'POST', body: accountData('student', 3) });
  const thirdRequest = await request('/api/student/passes', { token: thirdStudent.data.token, method: 'POST', body: { pickupPoint: pickup._id } });
  await asAdmin('/transport-requests/' + thirdRequest.data._id + '/approve', {}, 'PUT');
  await asAdmin('/buses/' + bus._id, { capacity: 2 }, 'PUT');
  const concurrentAllocations = await Promise.all([
    asAdmin('/students/allocate', { ...allocateBody, studentId: secondStudent.data._id }),
    asAdmin('/students/allocate', { ...allocateBody, studentId: thirdStudent.data._id }),
  ]);
  check('concurrent assignments respect final seat capacity', concurrentAllocations.map(result => result.status).sort(), [201, 409]);
  check('concurrent allocation persists exactly two seats', await BusAssignment.countDocuments({ bus: bus._id, status: 'active' }), 2);
  check('capacity cannot fall below assigned students', (await asAdmin('/buses/' + bus._id, { capacity: 1 }, 'PUT')).status, 409);
  check('referenced bus deletion blocked', (await asAdmin(`/buses/${bus._id}`, undefined, 'DELETE')).status, 409);
  check('referenced route deletion blocked', (await asAdmin(`/routes/${route._id}`, undefined, 'DELETE')).status, 409);
  check('referenced pickup deletion blocked', (await asAdmin(`/pickup-points/${pickup._id}`, undefined, 'DELETE')).status, 409);
  const unusedBus = (await asAdmin('/buses', { busNumber: '02', registrationNumber: 'TEMP-02', capacity: 5 })).data;
  check('unused bus deletion', (await asAdmin(`/buses/${unusedBus._id}`, undefined, 'DELETE')).status, 200);
  const unusedRoute = (await asAdmin('/routes', { routeName: 'Temporary', routeCode: 'TMP', startPoint: 'A', endPoint: 'B' })).data;
  const unusedPickup = (await asAdmin('/pickup-points', { name: 'Temporary stop', location: 'Temporary Road', route: unusedRoute._id, sequence: 1 })).data;
  check('unused pickup deletion', (await asAdmin(`/pickup-points/${unusedPickup._id}`, undefined, 'DELETE')).status, 200);
  check('pickup deletion updates route', (await asAdmin(`/routes/${unusedRoute._id}`)).data.pickupPoints.length, 0);
  check('unused route deletion', (await asAdmin(`/routes/${unusedRoute._id}`, undefined, 'DELETE')).status, 200);
  check('password reset protected', (await request('/api/auth/reset-driver-password', { method: 'POST', body: {} })).status, 401);
  check('student cannot reset driver password', (await request('/api/auth/reset-driver-password', { token: accounts.student.token, method: 'POST', body: {} })).status, 403);
  check('removed driver feature returns 404', (await asDriver('/bus-problems')).status, 404);
  check('removed admin feature returns 404', (await asAdmin('/bus-problems')).status, 404);
  check('student cannot create assignment', (await asStudent('/buspasses', {})).status, 404);
  const collections = (await mongoose.connection.db.listCollections().toArray()).map(item => item.name).sort();
  check('exactly nine database collections', collections, ['students', 'drivers', 'admins', 'buses', 'routes', 'pickuppoints', 'transportrequests', 'busassignments', 'attendances'].sort());
  console.log(`PASS ${count} real API/database assertions`);
  if (serve) { console.log(`BROWSER_READY ${base} database=${database}; test password=${password}; accounts student1@campus.example / driver1@campus.example / admin@campus.example`); return; }
  await close();
}
main().catch(async error => {
  console.error(error instanceof assert.AssertionError ? `FAIL ${error.message.split('\n')[0]}; actual=${JSON.stringify(error.actual)} expected=${JSON.stringify(error.expected)}` : `FAIL ${error.name}: ${error.message.startsWith('Operation') ? error.message : 'Test setup or API request failed'}`);
  await close().catch(() => console.error(`Cleanup requires attention for ${database}`));
  process.exit(1);
});
