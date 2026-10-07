const { fail, pick, text } = require('../../common/utils/http');
const { phone } = require('../../common/services/accounts');

const busData = body => pick(body, ['busNumber', 'registrationNumber', 'capacity', 'busType', 'status']);
const routeData = body => pick(body, ['routeName', 'routeCode', 'description', 'startPoint', 'endPoint', 'status', 'timings']);
const pickupData = body => pick(body, ['name', 'location', 'landmark', 'route', 'sequence', 'status', 'pickupTime']);

function requestFilter(query) {
  if (query.status && !['pending', 'approved', 'rejected'].includes(query.status)) fail(400, 'Invalid request status.');
  return query.status ? { status: query.status } : {};
}

const rejectionReason = (body, status) => status === 'rejected' ? text(body.rejectionReason, 'Rejection reason', { max: 500 }) : null;

function accountChanges(body, fields) {
  const changes = pick(body, fields);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  return changes;
}

module.exports = { busData, routeData, pickupData, requestFilter, rejectionReason, accountChanges };
