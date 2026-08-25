import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { login, logout, refresh, me, changePassword, forgotPassword, resetPassword, updateProfile, loginHistory, revokeSession, revokeOtherSessions } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Throttle sensitive endpoints.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many attempts, try again later.' } });
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter,
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth,
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate, changePassword);
router.put('/profile', requireAuth,
  body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
  validate, updateProfile);
router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/reset-password', resetLimiter,
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate, resetPassword);
router.get('/login-history', requireAuth, loginHistory);
router.delete('/sessions/:id', requireAuth, revokeSession);
router.post('/sessions/revoke-others', requireAuth, revokeOtherSessions);

export default router;
