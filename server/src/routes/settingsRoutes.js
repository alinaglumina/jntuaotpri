import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();
router.get('/', getSettings);                                   // public
router.put('/', requireAuth, requireRole('admin'), updateSettings);
export default router;
