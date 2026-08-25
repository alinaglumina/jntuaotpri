import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import * as M from '../models/index.js';
import { AuditLog } from '../models/index.js';

// Admin dashboard summary: counts per resource + recent activity.
const COUNTS = {
  notifications: M.Notification, news: M.News, circulars: M.Circular, downloads: M.Download,
  events: M.Event, gallery: M.GalleryItem, emagazines: M.EMagazine, faculty: M.Faculty,
  departments: M.Department, students: M.Student, mous: M.Mou, media: M.MediaFile, users: M.User,
};

export const dashboard = asyncHandler(async (req, res) => {
  const entries = await Promise.all(
    Object.entries(COUNTS).map(async ([key, model]) => [key, await model.countDocuments()])
  );
  const counts = Object.fromEntries(entries);
  const recent = await AuditLog.find().sort('-at').limit(10).lean();
  return ok(res, { counts, recent, generatedAt: new Date() });
});
