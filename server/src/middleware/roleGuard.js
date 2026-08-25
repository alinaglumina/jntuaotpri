import ApiError from '../utils/ApiError.js';

// requireRole('admin') — super admin only.
// requireRole('admin','director') — any authenticated staff.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

// Directors may only touch their own directorate's content; admin bypasses.
export function requireDirectorate(paramKey = 'directorate') {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'admin') return next();
    const target = req.params[paramKey] || req.body[paramKey];
    if (target && target !== req.user.directorate) return next(ApiError.forbidden());
    next();
  };
}
