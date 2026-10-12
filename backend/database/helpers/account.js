const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9 ()-]{6,19}$/;
const emailField = () => ({ type: String, required: true, unique: true, lowercase: true, trim: true, match: emailPattern });
const phoneField = (required = true) => ({ type: String, required, trim: true, validate: { validator: value => !value || (phonePattern.test(value) && value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15), message: 'Enter a valid phone number.' } });
const identifier = prefix => ({ type: String, unique: true, trim: true, default: () => `${prefix}-${crypto.randomUUID()}` });

function addAuthentication(schema, { verification = true } = {}) {
  schema.add({ password: { type: String, required: true, select: false, minlength: 8, validate: { validator: value => Buffer.byteLength(value, 'utf8') <= 72, message: 'Password must use at most 72 UTF-8 bytes.' } } });
  if (verification) schema.add({
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  });
  schema.pre('save', async function () {
    if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  });
  schema.methods.matchPassword = function (password) { return bcrypt.compare(password, this.password); };
  schema.set('toJSON', { transform: (_document, object) => {
    delete object.password;
    delete object.emailVerificationToken;
    delete object.emailVerificationExpires;
    return object;
  } });
}
module.exports = { addAuthentication, emailField, phoneField, identifier, emailPattern, phonePattern };
