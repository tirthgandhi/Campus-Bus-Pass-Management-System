const crypto = require('node:crypto');
const { models, validRole, email, password, registration, identity } = require('../services/accounts');
const { fail, found, ok, text } = require('../utils/http');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/email');
const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
async function createAccount(req, verified) {
  const { role, data } = registration(req.body);
  const filter = role === 'student' ? { $or: [{ collegeEmail: data.collegeEmail }, { studentId: data.studentId }] } : { $or: [{ email: data.email }, { licenseNumber: data.licenseNumber }] };
  if (await models[role].exists(filter)) fail(409, 'An account with these details already exists.');
  const verificationToken = verified ? null : crypto.randomBytes(32).toString('hex');
  const account = new models[role]({ ...data, isVerified: verified, ...(!verified ? { emailVerificationToken: tokenHash(verificationToken), emailVerificationExpires: new Date(Date.now() + 86400000) } : {}) });
  await account.save();
  if (!verified) {
    try { await sendVerificationEmail(identity(account, role).email, verificationToken, role); }
    catch { await models[role].deleteOne({ _id: account._id }); fail(503, 'Verification email could not be sent. Please try again.'); }
  }
  return { account, role };
}
exports.signup = async (req, res) => {
  const { account, role } = await createAccount(req, true);
  return ok(res, { ...identity(account, role), token: generateToken(account._id, role) }, 'Account created successfully', 201);
};
exports.register = async (req, res) => { await createAccount(req, false); return ok(res, {}, 'Check your email to verify your account.', 201); };
async function signIn(req, res, verifiedOnly = false) {
  const role = validRole(req.body.role);
  const address = email(req.body.email);
  if (typeof req.body.password !== 'string' || !req.body.password) fail(400, 'Password is required.');
  if (Buffer.byteLength(req.body.password, 'utf8') > 72) fail(401, 'Invalid email or password.');
  const account = await models[role].findOne(role === 'student' ? { collegeEmail: address } : { email: address }).select('+password');
  if (!account || !(await account.matchPassword(req.body.password))) fail(401, 'Invalid email or password.');
  if (account.status === 'inactive' || account.transportStatus === 'inactive') fail(403, 'This account is inactive.');
  if (verifiedOnly && role !== 'admin' && !account.isVerified) fail(403, 'Please verify your email before signing in.');
  const token = generateToken(account._id, role);
  const user = identity(account, role);
  return res.status(200).json({ success: true, message: 'Login successful', token, user, data: { ...user, token, user } });
}
exports.login = (req, res) => signIn(req, res);
exports.loginVerified = (req, res) => signIn(req, res, true);
exports.getMe = (req, res) => ok(res, identity(req.account, req.user.role));
exports.verifyEmail = async (req, res) => {
  const role = validRole(req.query.role);
  if (role === 'admin') fail(400, 'This account does not require email verification.');
  const token = text(req.query.token, 'Verification token');
  const account = await models[role].findOne({ emailVerificationToken: tokenHash(token), emailVerificationExpires: { $gt: new Date() } });
  if (!account) fail(400, 'Invalid or expired verification link.');
  account.isVerified = true;
  account.emailVerificationToken = undefined;
  account.emailVerificationExpires = undefined;
  await account.save();
  return ok(res, {}, 'Email verified. You can now sign in.');
};
exports.resetDriverPassword = async (req, res) => {
  const account = found(await models.driver.findOne({ email: email(req.body.email) }), 'Driver');
  account.password = password(req.body.newPassword);
  await account.save();
  return ok(res, {}, 'Driver password updated');
};
