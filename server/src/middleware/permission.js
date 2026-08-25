import ApiError from '../utils/ApiError.js';
import { Role } from '../models/index.js';
import { SYSTEM_ROLES, roleHasPermission } from '../config/permissions.js';

// Resolves a user's effective permissions: a DB Role by name, else the seeded
// system role. Cached briefly per-request via req._perms.
async function permsFor(user) {
  if (!user) return [];
  const dbRole = await Role.findOne({ name: user.role }).lean().catch(() => null);
  if (dbRole) return dbRole.permissions;
  return SYSTEM_ROLES[user.role]?.permissions || [];
}

// Gate a route on a specific permission string (e.g. 'roles:manage').
export function requirePermission(perm) {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(ApiError.unauthorized());
      const perms = req._perms || (req._perms = await permsFor(req.user));
      if (!roleHasPermission(perms, perm)) return next(ApiError.forbidden(`Missing permission: ${perm}`));
      next();
    } catch (e) { next(e); }
  };
}
