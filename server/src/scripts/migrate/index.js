/**
 * Phase 4 ETL — migrates the legacy MySQL dump + JSON stores into MongoDB and
 * copies the asset folders. Idempotent (upserts by natural keys).
 *
 *   node src/scripts/migrate/index.js --dry-run     # validate only, no DB, no copy
 *   node src/scripts/migrate/index.js               # full migration
 *
 * Config via env (or defaults):
 *   SQL_DUMP, JSON_DIR, UPLOADS_SRC, FILES_SRC, PUBLIC_ASSET_BASE, UPLOAD_DIR
 */
import path from 'path';
import mongoose from 'mongoose';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';
import connectDB from '../../config/db.js';
import * as Models from '../../models/index.js';
import { parseSqlDump } from './sqlParser.js';
import { buildUserData, transformSql, transformJson, makeUrlRewriter } from './transformers.js';
import { copyAssets } from './assets.js';

const DRY = process.argv.includes('--dry-run');
const cfg = {
  sqlDump: process.env.SQL_DUMP || path.resolve('migrate-src/dump.sql'),
  jsonDir: process.env.JSON_DIR || path.resolve('migrate-src/data'),
  uploadsSrc: process.env.UPLOADS_SRC || path.resolve('migrate-src/uploads'),
  filesSrc: process.env.FILES_SRC || path.resolve('migrate-src/files'),
  destDir: path.resolve(process.env.UPLOAD_DIR || 'uploads'),
  assetBase: process.env.PUBLIC_ASSET_BASE || env.upload.assetBase || '',
};

// Natural upsert key per model (so re-running doesn't duplicate).
const UPSERT_KEY = {
  User: 'username', Administration: 'roleKey', DirectorateContent: 'directorateKey',
  SiteSetting: 'key', PageContent: 'key', Regulation: 'code',
};

async function run() {
  const fs = await import('fs');
  if (!fs.existsSync(cfg.sqlDump)) {
    logger.warn(`SQL dump not found at ${cfg.sqlDump}. Set SQL_DUMP or place it there.`);
  }
  const rewrite = makeUrlRewriter(cfg.assetBase);

  // 1) Parse + transform
  const sql = fs.existsSync(cfg.sqlDump) ? parseSqlDump(cfg.sqlDump) : {};
  const { usersOut, idToUsername } = buildUserData(sql);
  const sqlDocs = transformSql(sql, rewrite, idToUsername);
  const jsonDocs = transformJson(cfg.jsonDir, rewrite);

  const plan = { User: usersOut, ...sqlDocs, ...jsonDocs };

  // 2) Validate every doc against its schema (no DB needed)
  const report = [];
  let totalErrors = 0;
  for (const [model, docs] of Object.entries(plan)) {
    const Model = Models[model];
    if (!Model) { report.push([model, docs.length, 'NO MODEL']); continue; }
    let errs = 0;
    for (const d of docs) {
      const clean = stripInternal(d);
      const err = new Model(clean).validateSync();
      if (err) { errs++; totalErrors++; }
    }
    report.push([model, docs.length, errs ? `${errs} invalid` : 'ok']);
  }

  logger.info(`ETL plan (${DRY ? 'DRY RUN' : 'LIVE'}) — asset base: ${cfg.assetBase || '(relative)'}`);
  for (const [m, n, s] of report) logger.info(`  ${m.padEnd(20)} ${String(n).padStart(4)}  ${s}`);
  const grand = Object.values(plan).reduce((a, d) => a + d.length, 0);
  logger.info(`  ${'TOTAL'.padEnd(20)} ${String(grand).padStart(4)} documents, ${totalErrors} validation errors`);

  if (DRY) { logger.info('Dry run complete — no data written, no assets copied.'); return; }

  // 3) Live: connect + load
  await connectDB();
  const userIdByName = {};

  // Users first (so content FKs resolve)
  for (const u of plan.User) {
    const doc = await Models.User.findOneAndUpdate(
      { username: u.username }, { $set: stripInternal(u) }, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userIdByName[u.username] = doc._id;
  }

  // Media folders (map legacy id → ObjectId, then wire parents)
  const folderIdMap = {};
  for (const f of plan.MediaFolder) {
    const doc = await Models.MediaFolder.findOneAndUpdate(
      { name: f.name, createdBy: f.createdBy }, { $set: { name: f.name, createdBy: f.createdBy } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    folderIdMap[f._legacyId] = doc._id;
  }
  for (const f of plan.MediaFolder) {
    if (f._legacyParent && f._legacyParent !== 'root' && folderIdMap[f._legacyParent]) {
      await Models.MediaFolder.updateOne({ _id: folderIdMap[f._legacyId] }, { $set: { parentId: folderIdMap[f._legacyParent] } });
    }
  }

  // Everything else
  for (const [model, docs] of Object.entries(plan)) {
    if (['User', 'MediaFolder'].includes(model)) continue;
    const Model = Models[model];
    if (!Model || docs.length === 0) continue;
    const key = UPSERT_KEY[model];
    for (const raw of docs) {
      const d = stripInternal(raw);
      if (raw._fkCreatedBy && userIdByName[raw._fkCreatedBy]) d.createdBy = userIdByName[raw._fkCreatedBy];
      if (model === 'MediaFile' && raw._legacyFolder && folderIdMap[raw._legacyFolder]) d.folderId = folderIdMap[raw._legacyFolder];
      if (key) await Model.updateOne({ [key]: d[key] }, { $set: d }, { upsert: true });
      else await Model.create(d);
    }
    logger.info(`  loaded ${docs.length} → ${model}`);
  }

  // 4) Assets
  logger.info('Copying assets…');
  const assetReport = copyAssets({ uploadsSrc: cfg.uploadsSrc, filesSrc: cfg.filesSrc, destDir: cfg.destDir });
  logger.info(`  uploads: ${assetReport.uploads?.copied ?? 0} files, dacp-legacy: ${assetReport.files?.copied ?? 0} files`);

  logger.info('Migration complete.');
  await mongoose.disconnect();
}

// Remove internal helper keys before persisting/validating.
function stripInternal(d) {
  const o = {};
  for (const [k, v] of Object.entries(d)) if (!k.startsWith('_')) o[k] = v;
  return o;
}

run().catch((e) => { logger.error(e.stack || e.message); process.exit(1); });
