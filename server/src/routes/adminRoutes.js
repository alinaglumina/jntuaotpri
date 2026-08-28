import { Router } from 'express';
import { RESOURCES } from '../config/resources.js';
import { crudController } from '../controllers/crudController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requirePermission } from '../middleware/permission.js';
import { resourceUpload, resourceUploadMulti, resourceUploadFields } from '../middleware/resourceUpload.js';
import { getPresignedUploadUrl } from '../config/cloudflareR2.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { auditLogger } from '../middleware/audit.js';
import * as media from '../controllers/mediaController.js';
import { adminSearch } from '../controllers/adminSearchController.js';
import * as users from '../controllers/usersController.js';
import * as roles from '../controllers/rolesController.js';
import { dashboard } from '../controllers/dashboardController.js';
import { listLogs } from '../controllers/logsController.js';
import { contactInbox, enquiryInbox } from '../controllers/messagesController.js';
import { backupInfo, downloadBackup } from '../controllers/backupController.js';
import { uploader } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);   // every /api/admin route requires a session

// Presigned direct-to-R2 upload — the browser uploads the file bytes straight
// to Cloudflare, bypassing this server entirely. Avoids platform request
// timeouts (e.g. Render) for large files (videos, big PDFs).
router.post('/uploads/presign', asyncHandler(async (req, res) => {
  const { subdir, filename, contentType } = req.body;
  if (!subdir || !filename) return res.status(400).json({ success: false, data: null, error: 'subdir and filename are required' });
  const result = await getPresignedUploadUrl(subdir, filename, contentType);
  return ok(res, result);
}));
router.get('/search', adminSearch);   // cross-resource admin search (authed)
router.use(auditLogger);   // record all successful mutations

function scopedFilter(def) {
  return (req) => {
    if (!def.sectionField) return {};
    if (req.user.role === 'admin') {
      // Admin browsing "unscoped" — optionally drill into one directorate via ?directorate=
      const q = req.query.directorate;
      return q ? { [def.sectionField]: { $regex: `^(dir-)?${q}`, $options: 'i' } } : {};
    }
    if (!req.user.directorate) return {};
    return { [def.sectionField]: { $regex: `^(dir-)?${req.user.directorate}`, $options: 'i' } };
  };
}

// Directors can only WRITE into their own directorate's scope — forces the
// section field server-side so a director can't spoof another directorate's key.
function scopedWrite(def) {
  return (body, req) => {
    if (def.sectionField && req.user.role !== 'admin' && req.user.directorate) {
      body[def.sectionField] = req.user.directorate;
    }
    return body;
  };
}

// ── Generic CRUD for every registered resource ──
for (const [key, def] of Object.entries(RESOURCES)) {
  const c = crudController(def.model, { searchable: def.searchable || [], baseFilter: scopedFilter(def), beforeWrite: scopedWrite(def) });
  const guard = requireRole(...def.roles);
  const withUpload = [
    ...(def.upload ? [resourceUpload(def.upload[0], def.upload[1])] : []),
    ...(def.uploadMulti ? [resourceUploadMulti(def.uploadMulti[0], def.uploadMulti[1], def.uploadMulti[2])] : []),
    ...(def.uploadFields ? [resourceUploadFields(def.uploadFields)] : []),
  ];
  router.get(`/${key}`, guard, c.list);
  router.get(`/${key}/:id`, guard, c.getOne);
  router.post(`/${key}`, guard, ...withUpload, c.create);
  router.put(`/${key}/:id`, guard, ...withUpload, c.update);
  router.delete(`/${key}/:id`, guard, c.remove);
  router.post(`/${key}/:id/restore`, guard, c.restore);
}

// ── Dashboard summary ──
router.get('/dashboard', dashboard);

// ── Media library ──
// View, upload, and download-report are open to admin + director.
// Replace, delete, bulk actions, and folder management are admin-only.
router.get('/media', media.listMedia);
router.post('/media', uploader('media-library').single('file'), media.uploadMedia);
router.get('/media/report', media.downloadReport);
router.put('/media/:id/replace', requireRole('admin'), uploader('media-library').single('file'), media.replaceMedia);
router.post('/media/folders', requireRole('admin'), media.createFolder);
router.post('/media/bulk-delete', requireRole('admin'), media.bulkDelete);
router.post('/media/bulk-move', requireRole('admin'), media.bulkMove);
router.delete('/media/:id', requireRole('admin'), media.deleteMedia);
router.delete('/media/folders/:id', requireRole('admin'), media.deleteFolder);

// ── Users (permission-gated) ──
router.get('/users', requirePermission('users:manage'), users.listUsers);
router.post('/users', requirePermission('users:manage'), users.createUser);
router.put('/users/:id', requirePermission('users:manage'), users.updateUser);
router.delete('/users/:id', requirePermission('users:manage'), users.deleteUser);

// ── Roles & Permissions ──
router.get('/permissions', requirePermission('roles:manage'), roles.listPermissions);
router.get('/roles', requirePermission('roles:manage'), roles.listRoles);
router.post('/roles', requirePermission('roles:manage'), roles.createRole);
router.put('/roles/:id', requirePermission('roles:manage'), roles.updateRole);
router.delete('/roles/:id', requirePermission('roles:manage'), roles.deleteRole);

// ── Audit logs ──
router.get('/logs', requirePermission('logs:read'), listLogs);


// ── Contact messages inbox ──
router.get('/contact-messages', requirePermission('messages:manage'), contactInbox.list);
router.patch('/contact-messages/:id', requirePermission('messages:manage'), contactInbox.updateStatus);
router.delete('/contact-messages/:id', requirePermission('messages:manage'), contactInbox.remove);

// ── Enquiries inbox ──
router.get('/enquiries', requirePermission('messages:manage'), enquiryInbox.list);
router.patch('/enquiries/:id', requirePermission('messages:manage'), enquiryInbox.updateStatus);
router.delete('/enquiries/:id', requirePermission('messages:manage'), enquiryInbox.remove);

// ── Backup management ──
router.get('/backup/info', requirePermission('backup:manage'), backupInfo);
router.get('/backup/download', requirePermission('backup:manage'), downloadBackup);

// Lists the resources this user may manage (drives the client sidebar).
router.get('/_resources', (req, res) => {
  const list = Object.entries(RESOURCES)
    .filter(([, def]) => def.roles.includes(req.user.role))
    .map(([key, def]) => ({ key, upload: !!def.upload, sectionField: def.sectionField || null }));
  res.json({ success: true, data: { resources: list, role: req.user.role, directorate: req.user.directorate }, error: null });
});

export default router;
