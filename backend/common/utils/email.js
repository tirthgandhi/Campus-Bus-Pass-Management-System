const nodemailer = require('nodemailer');
async function sendVerificationEmail(email, token, role) {
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } });
  const url = new URL('/api/auth/verify-email', process.env.API_PUBLIC_URL || 'http://localhost:5000');
  url.searchParams.set('token', token);
  url.searchParams.set('role', role);
  await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: 'Verify your Campus Bus account', text: `Verify your campus transport account: ${url.href}` });
}
module.exports = { sendVerificationEmail };
