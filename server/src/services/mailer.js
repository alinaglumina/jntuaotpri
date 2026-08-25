import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;
if (env.mail?.host && env.mail?.user) {
  transporter = nodemailer.createTransport({
    host: env.mail.host, port: env.mail.port,
    secure: env.mail.port === 465,
    auth: { user: env.mail.user, pass: env.mail.pass },
  });
}

// Sends mail if SMTP is configured; otherwise logs it (so dev/sandbox still works).
export async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    logger.warn(`[mailer] SMTP not configured — email to ${to} not sent. Subject: ${subject}`);
    logger.info(`[mailer] Body: ${text || html}`);
    return { queued: false, logged: true };
  }
  await transporter.sendMail({ from: env.mail.from || 'no-reply@jntua.ac.in', to, subject, html, text });
  return { queued: true };
}

export function passwordResetEmail(resetUrl, username) {
  const text = `A password reset was requested for ${username}. Reset link (valid ${env.jwt.resetTtlMin} min): ${resetUrl}. If you didn't request this, ignore this email.`;
  const html = `<p>A password reset was requested for <strong>${username}</strong>.</p>
    <p><a href="${resetUrl}">Reset your password</a> (valid for ${env.jwt.resetTtlMin} minutes).</p>
    <p style="color:#888">If you didn't request this, you can safely ignore this email.</p>`;
  return { subject: 'JNTUA — Password Reset', text, html };
}
