const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { migrateLegacyDrivers } = require('../scripts/migrate-legacy-drivers');

const passwordHash = bcrypt.hashSync('legacy-password', 10);

function collections() {
  const driver = {
    _id: 'driver-1',
    user: 'user-1',
    driverId: 'DRV-1',
    phone: '+1 555 123 4567',
    licenseNumber: 'dl-123',
  };
  const user = {
    _id: 'user-1',
    role: 'driver',
    name: 'Legacy Driver',
    email: 'DRIVER@example.com',
    password: passwordHash,
    isEmailVerified: true,
  };
  const updates = [];
  const drivers = {
    find: () => ({ toArray: async () => [driver] }),
    findOne: async () => null,
    updateOne: async (filter, update) => {
      updates.push({ filter, update });
      return { matchedCount: 1 };
    },
  };
  const users = {
    find: () => ({ toArray: async () => [user] }),
  };
  return { drivers, users, updates, driver, user };
}

test('migration defaults to a no-write dry run', async () => {
  const state = collections();
  const report = await migrateLegacyDrivers(state);

  assert.equal(report.eligible, 1);
  assert.equal(report.migrated, 0);
  assert.equal(state.updates.length, 0);
});

test('apply copies the legacy bcrypt hash and leaves the linked user intact', async () => {
  const state = collections();
  const report = await migrateLegacyDrivers({ ...state, apply: true });
  const update = state.updates[0].update.$set;

  assert.equal(report.migrated, 1);
  assert.equal(update.password, passwordHash);
  assert.equal(update.email, 'driver@example.com');
  assert.equal(update.isVerified, true);
  assert.equal(state.updates[0].filter.user, state.driver.user);
  assert.equal(state.user.password, passwordHash);
  assert.equal('$unset' in state.updates[0].update, false);
});

test('invalid legacy hashes are skipped without writing', async () => {
  const state = collections();
  state.user.password = 'not-a-bcrypt-hash';
  const report = await migrateLegacyDrivers({ ...state, apply: true });

  assert.equal(report.eligible, 0);
  assert.equal(report.migrated, 0);
  assert.equal(report.skipped.invalid_legacy_password_hash, 1);
  assert.equal(state.updates.length, 0);
});
