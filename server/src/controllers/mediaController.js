import fs from 'fs';
import path from 'path';
import asyncHandler from '../utils/asyncHandler.js';
import { validateFileContent } from '../middleware/fileValidation.js';
import { optimizeImage } from '../services/imageOptimize.js';
import { categorize } from '../utils/fileType.js';
import { ok } from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { MediaFile, MediaFolder } from '../models/index.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import env from '../config/env.js';

const diskPath = (storedName) => path.join(process.cwd(), env.upload.dir, 'media-library', storedName);
const unlinkQuiet = (p) => { try { fs.unlinkSync(p); } catch { /* already gone */ } };

export const listMedia = asyncHandler(async (req, res) => {
  const folderId = req.query.folder && req.query.folder !== 'root' ? req.query.folder : null;
  const typeFilter = req.query.type ? { fileType: req.query.type } : {};
  const [folders, files] = await Promise.all([
    MediaFolder.find(folderId ? { parentId: folderId } : { parentId: null }).sort('name').lean(),
    MediaFile.find({ ...(folderId ? { folderId } : { folderId: null }), ...typeFilter }).sort('-uploadedAt').lean(),
  ]);
  return ok(res, { folders, files });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  if (!validateFileContent(req.file.path).ok) { unlinkQuiet(req.file.path); throw ApiError.badRequest('File content does not match its extension'); }
  await optimizeImage(req.file.path);
  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  let cloud;
  try {
    cloud = await uploadToCloudinary(req.file.path, 'media-library');
  } finally {
    unlinkQuiet(req.file.path);
  }
  const doc = await MediaFile.create({
    folderId: req.body.folder && req.body.folder !== 'root' ? req.body.folder : null,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    ext, mimeType: req.file.mimetype,
    fileType: categorize(ext, req.file.mimetype),
    size: req.file.size,
    description: req.body.description || '',
    url: cloud.url,
    cloudinaryId: cloud.publicId,
    uploadedBy: req.user.username,
  });
  return ok(res, doc, 201);
});

// Replace the binary of an existing file, keeping the same record _id.
export const replaceMedia = asyncHandler(async (req, res) => {
  const doc = await MediaFile.findById(req.params.id);
  if (!doc) throw ApiError.notFound();
  if (!req.file) throw ApiError.badRequest('No replacement file uploaded');
  if (!validateFileContent(req.file.path).ok) { unlinkQuiet(req.file.path); throw ApiError.badRequest('File content does not match its extension'); }
  await optimizeImage(req.file.path);
  let cloud;
  try {
    cloud = await uploadToCloudinary(req.file.path, 'media-library');
  } finally {
    unlinkQuiet(req.file.path);
  }
  // remove the old binary — cloud asset if present, else legacy local file
  if (doc.cloudinaryId) await deleteFromCloudinary(doc.cloudinaryId);
  else unlinkQuiet(doc.storagePath || diskPath(doc.storedName));
  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  Object.assign(doc, {
    originalName: req.file.originalname, storedName: req.file.filename, ext,
    mimeType: req.file.mimetype, fileType: categorize(ext, req.file.mimetype),
    size: req.file.size, url: cloud.url, cloudinaryId: cloud.publicId, storagePath: '',
  });
  await doc.save();
  return ok(res, doc);
});

// Public download with tracking: increments count, then streams the file.
export const downloadMedia = asyncHandler(async (req, res) => {
  const doc = await MediaFile.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 }, $set: { lastDownloadedAt: new Date() } },
    { new: true }
  );
  if (!doc) throw ApiError.notFound();
  if (doc.cloudinaryId && doc.url) return res.redirect(doc.url);
  const file = doc.storagePath || diskPath(doc.storedName);
  if (!fs.existsSync(file)) throw ApiError.notFound('File missing from storage');
  return res.download(file, doc.originalName);
});

export const createFolder = asyncHandler(async (req, res) => {
  if (!req.body.name) throw ApiError.badRequest('Folder name is required');
  const doc = await MediaFolder.create({
    name: req.body.name,
    parentId: req.body.parent && req.body.parent !== 'root' ? req.body.parent : null,
    createdBy: req.user.username,
  });
  return ok(res, doc, 201);
});

// Delete DB record AND the binary from disk.
export const deleteMedia = asyncHandler(async (req, res) => {
  const doc = await MediaFile.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound();
  if (doc.cloudinaryId) await deleteFromCloudinary(doc.cloudinaryId);
  else unlinkQuiet(doc.storagePath || diskPath(doc.storedName));
  return ok(res, { id: req.params.id, deleted: true });
});

export const deleteFolder = asyncHandler(async (req, res) => {
  await MediaFile.updateMany({ folderId: req.params.id }, { $set: { folderId: null } });
  await MediaFolder.updateMany({ parentId: req.params.id }, { $set: { parentId: null } });
  await MediaFolder.findByIdAndDelete(req.params.id);
  return ok(res, { id: req.params.id, deleted: true });
});

// Bulk delete — removes records + binaries for many files at once.
export const bulkDelete = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) throw ApiError.badRequest('No files selected');
  const docs = await MediaFile.find({ _id: { $in: ids } });
  for (const d of docs) {
    if (d.cloudinaryId) await deleteFromCloudinary(d.cloudinaryId);
    else unlinkQuiet(d.storagePath || diskPath(d.storedName));
  }
  const result = await MediaFile.deleteMany({ _id: { $in: ids } });
  return ok(res, { deleted: result.deletedCount ?? 0 });
});

// Bulk move — reassigns many files to a folder (or root when folder is null).
export const bulkMove = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) throw ApiError.badRequest('No files selected');
  const folderId = req.body.folder && req.body.folder !== 'root' ? req.body.folder : null;
  const result = await MediaFile.updateMany({ _id: { $in: ids } }, { $set: { folderId } });
  return ok(res, { moved: result.modifiedCount ?? 0 });
});

// Download report — top files + totals.
export const downloadReport = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const [top, agg] = await Promise.all([
    MediaFile.find({ downloadCount: { $gt: 0 } }).sort('-downloadCount').limit(limit)
      .select('originalName fileType downloadCount lastDownloadedAt size url').lean(),
    MediaFile.aggregate([{ $group: { _id: null, totalDownloads: { $sum: '$downloadCount' }, files: { $sum: 1 } } }]),
  ]);
  return ok(res, { top, totalDownloads: agg[0]?.totalDownloads || 0, totalFiles: agg[0]?.files || 0 });
});
