import { Router } from 'express';
import authRoutes from './authRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';
import { search, popularSearches } from '../controllers/searchController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', ts: Date.now() }, error: null }));
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.get('/search', search);
router.get('/search/popular', popularSearches);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);   // /slides /gallery /mous /emagazines /news /honoris /administration ...

export default router;
