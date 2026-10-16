const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const { emailPattern, phonePattern } = require('../database/helpers/account');

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function validateCandidate(driver, user) {
  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  const phone = typeof driver.phone === 'string' ? driver.phone.trim() : '';
  const licenseNumber = typeof driver.licenseNumber === 'string'
    ? driver.licenseNumber.trim().toUpperCase()
    : '';

  if (user.role !== 'driver') return { reason: 'linked_user_not_driver' };
  if (typeof user.name !== 'string' || !user.name.trim()) return { reason: 'missing_name' };
  if (!emailPattern.test(email) || email.length > 254) return { reason: 'invalid_email' };
  if (!phonePattern.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) {
    return { reason: 'invalid_phone' };
  }
  if (!licenseNumber || licenseNumber.length > 60) return { reason: 'invalid_license_number' };
  if (typeof driver.driverId !== 'string' || !driver.driverId.trim()) return { reason: 'missing_driver_id' };
  if (typeof user.password !== 'string' || !bcryptHashPattern.test(user.password)) {
    return { reason: 'invalid_legacy_password_hash' };
  }

  return {
    candidate: {
      email,
      name: user.name.trim(),
      driverId: driver.driverId.trim().toUpperCase(),
      password: user.password,
      phone,
      licenseNumber,
      isVerified: Boolean(user.isEmailVerified),
      updatedAt: new Date(),
    },
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function migrateLegacyDrivers({ drivers, users, apply = false }) {
  const legacyDrivers = await drivers
    .find({ user: { $type: 'objectId' } })
    .toArray();
  const linkedUsers = legacyDrivers.length
    ? await users.find({
        _id: { $in: legacyDrivers.map((driver) => driver.user) },
        role: 'driver',
      }, {
        projection: { _id: 1, role: 1, name: 1, email: 1, password: 1, isEmailVerified: 1 },
      }).toArray()
    : [];
  const usersById = new Map(linkedUsers.map((user) => [String(user._id), user]));
  const report = { eligible: 0, migrated: 0, skipped: {} };

  function skip(reason) {
    report.skipped[reason] = (report.skipped[reason] || 0) + 1;
  }

  for (const driver of legacyDrivers) {
    if (driver.email !== undefined && driver.email !== null) {
      skip('already_has_email');
      continue;
    }

    const user = usersById.get(String(driver.user));
    if (!user) {
      skip('missing_linked_driver_user');
      continue;
    }

    const { candidate, reason } = validateCandidate(driver, user);
    if (reason) {
      skip(reason);
      continue;
    }

    const emailConflict = await drivers.findOne({
      _id: { $ne: driver._id },
      email: { $regex: `^${escapeRegex(candidate.email)}$`, $options: 'i' },
    }, { projection: { _id: 1 } });
    if (emailConflict) {
      skip('duplicate_email');
      continue;
    }

    const licenseConflict = await drivers.findOne({
      _id: { $ne: driver._id },
      licenseNumber: { $regex: `^${escapeRegex(candidate.licenseNumber)}$`, $options: 'i' },
    }, { projection: { _id: 1 } });
    if (licenseConflict) {
      skip('duplicate_license_number');
      continue;
    }

    report.eligible += 1;
    if (!apply) continue;

    const result = await drivers.updateOne(
      {
        _id: driver._id,
        user: driver.user,
        $or: [{ email: { $exists: false } }, { email: null }],
      },
      { $set: candidate },
    );
    if (result.matchedCount !== 1) {
      throw new Error('A legacy driver record changed during migration. Rerun the dry-run and review the results.');
    }
    report.migrated += 1;
  }

  return report;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !['--apply', '--dry-run'].includes(arg)) || (args.includes('--apply') && args.includes('--dry-run'))) {
    throw new Error('Use no option (dry-run), --dry-run, or --apply.');
  }

  const apply = args.includes('--apply');
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGO_URI or MONGODB_URI in backend/.env before running the migration.');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const database = mongoose.connection.db;
  const report = await migrateLegacyDrivers({
    drivers: database.collection('drivers'),
    users: database.collection('users'),
    apply,
  });

  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN (no changes made)'}`);
  console.log(`Eligible legacy driver accounts: ${report.eligible}`);
  console.log(`Migrated driver accounts: ${report.migrated}`);
  for (const [reason, count] of Object.entries(report.skipped)) {
    console.log(`Skipped (${reason}): ${count}`);
  }
}

if (require.main === module) {
  main()
    .catch(() => {
      console.error('Driver migration did not complete. Check database connectivity and migration eligibility.');
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { migrateLegacyDrivers, validateCandidate };
