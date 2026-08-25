import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

// Short-lived access token (identity + role claims).
export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role, dir: user.directorate }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}
export function verifyAccessToken(token) { return jwt.verify(token, env.jwt.secret); }

// Opaque refresh token: a random string sent to the client; only its SHA-256
// hash is stored server-side (so a DB leak can't be replayed).
export function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString('hex');
  return { raw, hash: hashToken(raw) };
}
export function hashToken(raw) { return crypto.createHash('sha256').update(raw).digest('hex'); }

// Password-reset token (same hash-at-rest pattern).
export function generateResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
}
