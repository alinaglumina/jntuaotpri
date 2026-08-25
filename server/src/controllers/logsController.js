import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { AuditLog } from '../models/index.js';

export const listLogs = asyncHandler(async (req, res) => {
  const { actor, action, resource, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (actor) filter.actor = actor;
  if (action) filter.action = action;
  if (resource) filter.resource = resource;
  const skip = (Math.max(1, +page) - 1) * +limit;
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort('-at').skip(skip).limit(Math.min(+limit, 200)).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return ok(res, { items, total, page: +page });
});
