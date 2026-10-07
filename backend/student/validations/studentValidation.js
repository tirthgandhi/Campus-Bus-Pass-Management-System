const { id, pick, text } = require('../../common/utils/http');
const { phone } = require('../../common/services/accounts');

function profileChanges(body) {
  const changes = pick(body, ['name', 'phone', 'department', 'semester']);
  if (changes.name !== undefined) changes.name = text(changes.name, 'Name');
  if (changes.department !== undefined) changes.department = text(changes.department, 'Department');
  if (changes.phone !== undefined) changes.phone = phone(changes.phone);
  return changes;
}

const pickupPointId = body => id(body.pickupPoint, 'pickup point ID');

module.exports = { profileChanges, pickupPointId };
