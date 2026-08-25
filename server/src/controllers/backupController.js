import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import * as Models from '../models/index.js';

const EXPORTABLE = [
  'Notification', 'News', 'Circular', 'Event', 'Admission', 'Examination', 'Result',
  'Download', 'GalleryItem', 'Video', 'EMagazine', 'Mou', 'Faculty', 'Department',
  'Student', 'Menu', 'PageContent', 'ContentBlock', 'SeoMeta', 'Administration',
  'DirectorateContent', 'HonorisCausa', 'SiteSetting', 'Role',
];

// Metadata about what a backup would contain (per-collection counts).
export const backupInfo = asyncHandler(async (req, res) => {
  const entries = await Promise.all(EXPORTABLE.map(async (name) => {
    const M = Models[name]; return [name, M ? await M.countDocuments().setOptions({ withDeleted: true }) : 0];
  }));
  return ok(res, { collections: Object.fromEntries(entries), total: entries.reduce((a, [, n]) => a + n, 0) });
});

// Download a full JSON snapshot (excludes users/passwords + audit logs).
export const downloadBackup = asyncHandler(async (req, res) => {
  const snapshot = { version: 2, generatedAt: new Date().toISOString(), data: {} };
  for (const name of EXPORTABLE) {
    const M = Models[name];
    if (M) snapshot.data[name] = await M.find().setOptions({ withDeleted: true }).lean();
  }
  const filename = `jntuaweb-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(JSON.stringify(snapshot, null, 2));
});
