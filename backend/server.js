const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const connectDB = require('./common/config/db');
const app = require('./app');
async function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT configuration is required.');
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Campus Bus backend listening on port ${port}`));
}
start().catch(() => { console.error('Backend startup failed. Check database and JWT configuration.'); process.exitCode = 1; });
