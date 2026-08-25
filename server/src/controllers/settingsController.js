import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { SiteSetting } from '../models/index.js';

export const getSettings = asyncHandler(async (req, res) => {
  const rows = await SiteSetting.find().lean();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return ok(res, map);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body || {});
  await Promise.all(entries.map(([key, value]) =>
    SiteSetting.updateOne({ key }, { $set: { value: String(value) } }, { upsert: true })
  ));
  const rows = await SiteSetting.find().lean();
  return ok(res, Object.fromEntries(rows.map((r) => [r.key, r.value])));
});
