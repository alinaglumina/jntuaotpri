import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { ContactMessage, Enquiry } from '../models/index.js';

// ── Public submit (rate-limited at the router) ──
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) throw ApiError.badRequest('Name, email and message are required');
  const doc = await ContactMessage.create({ ...req.body, ip: req.ip });
  return ok(res, { id: doc._id, received: true }, 201);
});
export const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) throw ApiError.badRequest('Name, email and message are required');
  const doc = await Enquiry.create({ ...req.body, ip: req.ip });
  return ok(res, { id: doc._id, received: true }, 201);
});

// ── Admin inbox (generic over the two models) ──
function inbox(Model) {
  return {
    list: asyncHandler(async (req, res) => {
      const { status, page = 1, limit = 50 } = req.query;
      const filter = status ? { status } : {};
      const skip = (Math.max(1, +page) - 1) * +limit;
      const [items, total, unread] = await Promise.all([
        Model.find(filter).sort('-createdAt').skip(skip).limit(Math.min(+limit, 200)).lean(),
        Model.countDocuments(filter),
        Model.countDocuments({ status: 'new' }),
      ]);
      return ok(res, { items, total, unread, page: +page });
    }),
    updateStatus: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
      if (!doc) throw ApiError.notFound();
      return ok(res, doc);
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw ApiError.notFound();
      await doc.softDelete();
      return ok(res, { id: req.params.id, deleted: true });
    }),
  };
}
export const contactInbox = inbox(ContactMessage);
export const enquiryInbox = inbox(Enquiry);
