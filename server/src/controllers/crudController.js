import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

/**
 * Builds list/get/create/update/remove handlers for any Mongoose model.
 * This is what lets one <CrudSection> React component + a manifest drive all
 * ~258 admin panels without hand-writing a controller per resource.
 *
 * @param {mongoose.Model} Model
 * @param {object} opts
 *   opts.searchable   string[] — fields included in ?q= text search
 *   opts.defaultSort  string   — e.g. '-createdAt'
 *   opts.baseFilter   fn(req)  — returns a mongo filter merged into every query
 *   opts.beforeWrite  fn(body, req) — mutate/validate payload before save
 */
export function crudController(Model, opts = {}) {
  const {
    searchable = [],
    defaultSort = '-createdAt',
    baseFilter = () => ({}),
    beforeWrite = (body) => body,
  } = opts;

  const list = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 100, sort, deleted } = req.query;
    const filter = { ...baseFilter(req) };
    if (deleted === 'only') filter.isDeleted = true;
    if (q && searchable.length) {
      filter.$or = searchable.map((f) => ({ [f]: { $regex: q, $options: 'i' } }));
    }
    const skip = (Math.max(1, +page) - 1) * +limit;
    const opts = deleted === 'only' || deleted === 'with' ? { withDeleted: true } : {};
    const [items, total] = await Promise.all([
      Model.find(filter).setOptions(opts).sort(sort || defaultSort).skip(skip).limit(Math.min(+limit, 500)).lean(),
      Model.countDocuments(filter).setOptions(opts),
    ]);
    return ok(res, { items, total, page: +page, limit: +limit });
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) throw ApiError.notFound();
    return ok(res, doc);
  });

  const create = asyncHandler(async (req, res) => {
    const payload = await beforeWrite({ ...req.body }, req);
    if (req.user) payload.createdBy = payload.createdBy || req.user._id;
    const doc = await Model.create(payload);
    return ok(res, doc, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const payload = await beforeWrite({ ...req.body }, req);
    const doc = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) throw ApiError.notFound();
    return ok(res, doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    if (typeof doc.softDelete === 'function' && !req.query.hard) await doc.softDelete();
    else await doc.deleteOne();
    return ok(res, { id: req.params.id, deleted: true, soft: !req.query.hard });
  });

  const restore = asyncHandler(async (req, res) => {
    const doc = await Model.findOne({ _id: req.params.id }).setOptions({ withDeleted: true });
    if (!doc) throw ApiError.notFound();
    if (typeof doc.restore === 'function') await doc.restore();
    return ok(res, doc);
  });

  return { list, getOne, create, update, remove, restore };
}
