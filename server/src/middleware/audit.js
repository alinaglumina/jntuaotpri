import { AuditLog } from '../models/index.js';
import logger from '../utils/logger.js';

const ACTION = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };

// Records every successful state-changing admin request to the audit log.
// Non-blocking: logging failures never break the request.
export function auditLogger(req, res, next) {
  const action = ACTION[req.method];
  if (!action) return next();
  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const resource = (req.baseUrl + req.path).replace(/^\/api\/admin\//, '').split('/')[0] || 'unknown';
    AuditLog.create({
      actor: req.user?.username || 'anonymous',
      action, resource,
      resourceId: req.params?.id || '',
      method: req.method, path: req.originalUrl, status: res.statusCode,
      ip: req.ip,
    }).catch((e) => logger.warn(`audit log failed: ${e.message}`));
  });
  next();
}

// Explicitly record an auth event (login/logout).
export function recordAuth(req, action, actor) {
  AuditLog.create({ actor, action, resource: 'auth', method: req.method, path: req.originalUrl, status: 200, ip: req.ip })
    .catch(() => {});
}
