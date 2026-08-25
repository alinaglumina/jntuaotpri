// One-time migration: reads the CURRENT static directorates.json (in the
// client project) and converts each directorate's tabs into DirectorateMenuItem
// database records, preserving nested dropdown groups and content exactly.
// Safe to re-run — upserts by {directorateKey, menuKey}, never duplicates.
// Run: node src/scripts/migrateDirectorateTabs.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import { DirectorateMenuItem } from '../models/index.js';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '../../../client/src/content/directorates.json');
const directorates = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function slugify(label) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Converts a static tab's `blocks` array into an HTML string for the
// 'page' type's `body` field.
function blocksToHtml(blocks = []) {
  return blocks.map((b) => {
    if (b.type === 'heading') {
      const level = Math.min((b.level || 1) + 1, 4);
      return `<h${level}>${b.text}</h${level}>`;
    }
    if (b.type === 'list') {
      return `<ul>${(b.items || []).map((it) => `<li>${it}</li>`).join('')}</ul>`;
    }
    return `<p>${b.text || ''}</p>`;
  }).join('\n');
}

async function run() {
  await connectDB();
  let count = 0;

  for (const [directorateKey, data] of Object.entries(directorates)) {
    const tabs = data.tabs || [];
    for (let i = 0; i < tabs.length; i++) {
      const t = tabs[i];
      const menuKey = slugify(t.label);

      if (t.children) {
        // Group tab: create the parent (empty page body, just a container),
        // then each child as a nested item.
        await DirectorateMenuItem.updateOne(
          { directorateKey, menuKey },
          { $setOnInsert: {
              directorateKey, menuKey, parentKey: null, label: t.label,
              type: 'page', body: '', linkResource: '', externalUrl: '',
              sortOrder: i, isActive: true,
            } },
          { upsert: true }
        );
        count++;
        for (let j = 0; j < t.children.length; j++) {
          const c = t.children[j];
          const childKey = slugify(c.label);
          await DirectorateMenuItem.updateOne(
            { directorateKey, menuKey: childKey },
            { $setOnInsert: {
                directorateKey, menuKey: childKey, parentKey: menuKey, label: c.label,
                type: 'page', body: blocksToHtml(c.blocks), linkResource: '', externalUrl: '',
                sortOrder: j, isActive: true,
              } },
            { upsert: true }
          );
          count++;
        }
      } else {
        // Leaf tab: content page directly.
        await DirectorateMenuItem.updateOne(
          { directorateKey, menuKey },
          { $setOnInsert: {
              directorateKey, menuKey, parentKey: null, label: t.label,
              type: 'page', body: blocksToHtml(t.blocks), linkResource: '', externalUrl: '',
              sortOrder: i, isActive: true,
            } },
          { upsert: true }
        );
        count++;
      }
    }
  }

  logger.info(`Migrated ${count} directorate menu items across ${Object.keys(directorates).length} directorates.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { logger.error(e); process.exit(1); });
