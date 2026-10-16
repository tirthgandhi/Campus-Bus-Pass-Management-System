const mongoose = require('mongoose');
const host = 'campus-bus-pass.jnsd7ky.mongodb.net';

// Corrected username (gandhitirthacpc09) + common Atlas username patterns
const combos = [
  ['gandhitirthacpc09', 'Gandhi%402506'],
  ['gandhitirthacpc09', 'Gandhi2506'],
  ['gandhitirthacpc',   'Gandhi%402506'],
  ['gandhitirth',       'Gandhi%402506'],
  ['tirth',             'Gandhi%402506'],
  ['admin',             'Gandhi%402506'],
];

(async () => {
  for (const [u, p] of combos) {
    const uri = `mongodb+srv://${u}:${p}@${host}/campusbuspass?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000`;
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`\nSUCCESS: username="${u}"  password_encoded="${p}"\n`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      const reason = e.message.includes('auth') ? 'auth failed' : e.message.slice(0, 70);
      process.stdout.write(`FAIL [${u}]: ${reason}\n`);
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }
  console.log('\nAll failed — need exact Atlas DB username from Database Access page.');
  process.exit(1);
})();
