const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Sends a notification email. Failures are logged but never thrown,
 * so a temporary SMTP outage never blocks a form submission from
 * being saved to the database.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[email:dev] Would send to ${to} — ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"Crystal Express Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('[email] Failed to send notification:', err.message);
  }
}

module.exports = sendEmail;
