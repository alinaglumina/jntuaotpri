import crypto from 'crypto';
import env, { isProd } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const CSRF_COOKIE = 'jntua_csrf';
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
// Endpoints that can't carry a CSRF token yet (pre-session) or are token-based.
const EXEMPT = ['/api/auth/login', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password'];

// Double-submit CSRF protection. A non-httpOnly `jntua_csrf` cookie is issued on
// safe requests; the SPA echoes it in the `X-CSRF-Token` header on every
// mutation. Because a cross-site attacker can't read the cookie, they can't
// forge the matching header — so state-changing requests are protected even with
// SameSite=None cookies (required for cross-origin deployments).
export function csrfProtection(req, res, next) {
  let token = req.cookies?.[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,                       // readable by the SPA to echo back
      secure: env.jwt.cookieSecure,
      sameSite: env.jwt.cookieSecure ? 'none' : 'lax',
      path: '/',
    });
  }
  if (SAFE.has(req.method) || EXEMPT.includes(req.path) || EXEMPT.includes(req.originalUrl.split('?')[0])) return next();

  const header = req.headers['x-csrf-token'];
  if (!header || header !== token) return next(ApiError.forbidden('Invalid or missing CSRF token'));
  next();
}
