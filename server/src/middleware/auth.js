import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/index.js';

// Reads JWT from httpOnly cookie (falls back to Authorization: Bearer).
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.jwt.cookieName]
      || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) throw ApiError.unauthorized();
    const payload = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account inactive or not found');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired session'));
  }
}
