import { Router } from 'express';
import { Notification } from '../models/index.js';
import { crudController } from '../controllers/crudController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const c = crudController(Notification, {
  searchable: ['title'],
  defaultSort: '-publishedAt',
  // Public list only shows active notifications; staff see all.
  baseFilter: (req) => ({ ...(req.user ? {} : { isActive: true }), ...(req.query.category ? { category: { $in: [req.query.category] } } : {}) }),
});

const router = Router();
router.get('/', c.list);           // public
router.get('/:id', c.getOne);      // public
router.post('/',    requireAuth, requireRole('admin', 'director'), c.create);
router.put('/:id',  requireAuth, requireRole('admin', 'director'), c.update);
router.delete('/:id', requireAuth, requireRole('admin', 'director'), c.remove);

export default router;
