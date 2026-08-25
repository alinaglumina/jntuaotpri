import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { User, RefreshToken, LoginHistory } from '../models/index.js';
import { signAccessToken, generateRefreshToken, hashToken, generateResetToken } from '../utils/tokens.js';
import { sendMail, passwordResetEmail } from '../services/mailer.js';

// ── cookie helpers ──
const accessCookie = () => ({ httpOnly: true, secure: env.jwt.cookieSecure, sameSite: env.jwt.cookieSecure ? 'none' : 'lax', maxAge: 15 * 60 * 1000, path: '/' });
const refreshCookie = () => ({ httpOnly: true, secure: env.jwt.cookieSecure, sameSite: env.jwt.cookieSecure ? 'none' : 'lax', maxAge: env.jwt.refreshTtlMs, path: '/api/auth' });

// Issues a new access cookie + a rotating refresh token (stored hashed).
async function issueSession(res, req, user) {
  res.cookie(env.jwt.cookieName, signAccessToken(user), accessCookie());
  const { raw, hash } = generateRefreshToken();
  await RefreshToken.create({
    user: user._id, tokenHash: hash,
    expiresAt: new Date(Date.now() + env.jwt.refreshTtlMs),
    userAgent: req.headers['user-agent'] || '', ip: req.ip,
  });
  res.cookie(env.jwt.refreshCookieName, raw, refreshCookie());
}

export const login = asyncHandler(async (req, res) => {
  const username = (req.body.username || '').trim().toLowerCase();
  const password = (req.body.password || '').trim();
  const audit = (success, reason, user) => LoginHistory.create({ user: user?._id || null, username, success, reason, ip: req.ip, userAgent: req.headers['user-agent'] || '' }).catch(() => {});

  if (!username || !password) throw ApiError.badRequest('Username and password are required');
  const user = await User.findOne({ $or: [{ username }, { email: username }], isActive: true }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password))) {
    await audit(false, 'invalid credentials');
    throw ApiError.unauthorized('Invalid username or password');
  }
  user.lastLogin = new Date();
  await user.save();
  await issueSession(res, req, user);
  await audit(true, '', user);
  return ok(res, user.toSafeJSON());
});

// Rotates the refresh token and issues a fresh access token.
export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[env.jwt.refreshCookieName];
  if (!raw) throw ApiError.unauthorized('No refresh token');
  const existing = await RefreshToken.findOne({ tokenHash: hashToken(raw) });
  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }
  const user = await User.findById(existing.user);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account inactive');

  // Rotate: revoke the old, issue a new one.
  const { raw: newRaw, hash: newHash } = generateRefreshToken();
  existing.revokedAt = new Date();
  existing.replacedByHash = newHash;
  await existing.save();
  await RefreshToken.create({ user: user._id, tokenHash: newHash, expiresAt: new Date(Date.now() + env.jwt.refreshTtlMs), userAgent: req.headers['user-agent'] || '', ip: req.ip });
  res.cookie(env.jwt.cookieName, signAccessToken(user), accessCookie());
  res.cookie(env.jwt.refreshCookieName, newRaw, refreshCookie());
  return ok(res, user.toSafeJSON());
});

export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[env.jwt.refreshCookieName];
  if (raw) await RefreshToken.updateOne({ tokenHash: hashToken(raw), revokedAt: null }, { revokedAt: new Date() });
  res.clearCookie(env.jwt.cookieName, { path: '/' });
  res.clearCookie(env.jwt.refreshCookieName, { path: '/api/auth' });
  return ok(res, { loggedOut: true });
});

export const me = asyncHandler(async (req, res) => ok(res, req.user.toSafeJSON()));

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) throw ApiError.badRequest('New password must be at least 8 characters');
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.verifyPassword(currentPassword || ''))) throw ApiError.unauthorized('Current password is incorrect');
  user.passwordHash = await User.hashPassword(newPassword);
  user.mustChangePwd = false;
  await user.save();
  // Security: revoke all other sessions on password change.
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
  return ok(res, { changed: true });
});

// Always responds 200 (never reveals whether an account exists).
export const forgotPassword = asyncHandler(async (req, res) => {
  const id = (req.body.username || req.body.email || '').trim().toLowerCase();
  const generic = { sent: true, message: 'If an account exists, a reset link has been sent.' };
  if (!id) return ok(res, generic);
  const user = await User.findOne({ $or: [{ username: id }, { email: id }], isActive: true });
  if (user) {
    const { raw, hash } = generateResetToken();
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = new Date(Date.now() + env.jwt.resetTtlMin * 60 * 1000);
    await user.save();
    const resetUrl = `${env.clientOrigin || ''}/reset-password?token=${raw}`;
    const mail = passwordResetEmail(resetUrl, user.username);
    const result = await sendMail({ to: user.email || user.username, ...mail });
    // In non-production without SMTP, surface the link so the flow is testable.
    if (!env.isProd && result.logged) return ok(res, { ...generic, devResetUrl: resetUrl });
  }
  return ok(res, generic);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) throw ApiError.badRequest('Token and a password of at least 8 characters are required');
  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires +passwordHash');
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');
  user.passwordHash = await User.hashPassword(newPassword);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.mustChangePwd = false;
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
  return ok(res, { reset: true });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const patch = {};
  if (req.body.fullName != null) patch.fullName = req.body.fullName;
  if (req.body.email != null) patch.email = String(req.body.email).toLowerCase();
  const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true, runValidators: true });
  return ok(res, user.toSafeJSON());
});

// Current user's recent login history + active sessions.
export const loginHistory = asyncHandler(async (req, res) => {
  const currentHash = req.cookies?.[env.jwt.refreshCookieName] ? hashToken(req.cookies[env.jwt.refreshCookieName]) : null;
  const [history, sessions] = await Promise.all([
    LoginHistory.find({ user: req.user._id }).sort('-at').limit(30).lean(),
    RefreshToken.find({ user: req.user._id, revokedAt: null, expiresAt: { $gt: new Date() } }).sort('-createdAt').lean(),
  ]);
  return ok(res, {
    history,
    activeSessions: sessions.map((s) => ({ id: s._id, ip: s.ip, userAgent: s.userAgent, since: s.createdAt, expiresAt: s.expiresAt, current: s.tokenHash === currentHash })),
  });
});

// Revoke one session (must belong to the current user).
export const revokeSession = asyncHandler(async (req, res) => {
  const token = await RefreshToken.findOne({ _id: req.params.id, user: req.user._id });
  if (!token) throw ApiError.notFound('Session not found');
  if (!token.revokedAt) { token.revokedAt = new Date(); await token.save(); }
  return ok(res, { id: req.params.id, revoked: true });
});

// Revoke every OTHER active session (keep the current one).
export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const currentHash = req.cookies?.[env.jwt.refreshCookieName] ? hashToken(req.cookies[env.jwt.refreshCookieName]) : null;
  const result = await RefreshToken.updateMany(
    { user: req.user._id, revokedAt: null, tokenHash: { $ne: currentHash } },
    { revokedAt: new Date() }
  );
  return ok(res, { revoked: result.modifiedCount ?? 0 });
});
