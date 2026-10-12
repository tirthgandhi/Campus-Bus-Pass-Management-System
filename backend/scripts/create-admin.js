// Run explicitly with ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and optional ADMIN_PHONE.
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const Admin = require('../database/models/Admin');
const { email, password } = require('../common/services/accounts');
const { text } = require('../common/utils/http');
async function main() {
  const data = { name: text(process.env.ADMIN_NAME, 'Admin name'), email: email(process.env.ADMIN_EMAIL), password: password(process.env.ADMIN_PASSWORD), phone: process.env.ADMIN_PHONE };
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  if (await Admin.exists({ email: data.email })) throw new Error('An admin with this email already exists.');
  await Admin.create(data);
  console.log('Administrator created. No credentials were printed.');
}
main().catch(() => { console.error('Admin creation failed. Check required settings or an existing account.'); process.exitCode = 1; }).finally(() => mongoose.disconnect());
