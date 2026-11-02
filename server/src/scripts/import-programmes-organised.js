import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import Download from '../models/Download.js';
import { uploadToR2 } from '../config/cloudflareR2.js';

const APPLY = process.argv.includes('--apply');
const SECTION = 'programmes-organised';
const links = JSON.parse(fs.readFileSync(new URL('./po-links.json', import.meta.url), 'utf8'));

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function parse(label) {
  const m = label.match(/^\s*(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})\s*[-:–]*\s*(.*)$/);
  let date = null, title = label.trim();
  if (m) {
    date = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    title = m[4].trim() || title;
  }
  if (/Pharmacovigilance week/i.test(label) && !date) {
    date = new Date(Date.UTC(2025, 8, 17));
    title = 'Report on Pharmacovigilance week (17th - 23rd September 2025)';
  }
  title = title.replace(/\.(pdf|png|jpe?g|docx?)$/i, '').trim();
  return { date, title };
}

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await Download.find({ section: SECTION }).lean();
const have = new Set(existing.map((d) => norm(d.title)));
console.log(`Existing in ${SECTION}: ${existing.length} | Links to consider: ${links.length} | Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

let added = 0, skipped = 0, failed = 0;
for (let i = 0; i < links.length; i++) {
  const { date, title } = parse(links[i].title);
  if (have.has(norm(title))) { console.log(`SKIP (exists): ${title}`); skipped++; continue; }
  const extMatch = links[i].url.split('?')[0].match(/\.([a-z0-9]+)$/i);
  const ext = (extMatch ? extMatch[1] : 'pdf').toLowerCase();
  const fileType = ext === 'jpeg' ? 'jpg' : ext;
  console.log(`${APPLY ? 'ADD' : 'WOULD ADD'}: [${date ? date.toISOString().slice(0, 10) : 'no date'}] ${title}  (${fileType})`);
  if (!APPLY) { added++; continue; }
  try {
    const res = await fetch(links[i].url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const tmp = path.join(os.tmpdir(), `po_${Date.now()}_${i}.${ext}`);
    fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
    const { url } = await uploadToR2(tmp, 'otpri/programmes-organised');
    fs.unlinkSync(tmp);
    await Download.create({ title, date, section: SECTION, attachment: url, fileType, sortOrder: i, isActive: true });
    have.add(norm(title));
    added++;
  } catch (e) {
    console.log('  FAILED:', e.message);
    failed++;
  }
}
console.log(`\nDone. ${APPLY ? 'Added' : 'Would add'}: ${added} | Skipped: ${skipped} | Failed: ${failed}`);
await mongoose.disconnect();
