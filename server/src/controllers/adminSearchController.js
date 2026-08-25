import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { RESOURCES } from '../config/resources.js';

// Admin-side search across every CRUD resource that declares `searchable` fields.
// Respects role scope: directors only see resources they can access. Returns
// results grouped by resource, each linking to /admin/r/:resource.
export const adminSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit || '5', 10), 10);
  if (q.length < 2) return ok(res, { query: q, groups: [], total: 0 });

  const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const role = req.user?.role;

  const entries = Object.entries(RESOURCES).filter(([, def]) =>
    Array.isArray(def.searchable) && def.searchable.length &&
    (role === 'admin' || (def.roles || []).includes(role))
  );

  const groups = await Promise.all(entries.map(async ([key, def]) => {
    const filter = { $or: def.searchable.map((f) => ({ [f]: rx })) };
    // Directors are scoped to their directorate on section-guarded resources.
    if (def.sectionField && role === 'director' && req.user?.directorate) filter[def.sectionField] = req.user.directorate;
    let docs;
    try { docs = await def.model.find(filter).limit(limit).lean(); } catch { docs = []; }
    const label = key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const items = docs.map((d) => ({
      id: String(d._id),
      title: d[def.searchable[0]] || d.title || d.name || '(untitled)',
      link: `/admin/r/${key}`,
    }));
    return { type: key, label, items, count: items.length };
  }));

  const populated = groups.filter((g) => g.count > 0);
  const total = populated.reduce((n, g) => n + g.count, 0);
  return ok(res, { query: q, groups: populated, total });
});
