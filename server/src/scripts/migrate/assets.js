import fs from 'fs';
import path from 'path';

// Recursively copy a source tree into destDir/<name>, skipping if src missing.
function copyTree(src, dest) {
  if (!fs.existsSync(src)) return { copied: 0, skipped: true };
  let copied = 0;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copied += copyTree(s, d).copied;
    else { fs.copyFileSync(s, d); copied++; }
  }
  return { copied, skipped: false };
}

// Copies legacy uploads/ (and optionally files/) into the API's uploads dir.
export function copyAssets({ uploadsSrc, filesSrc, destDir }) {
  const report = {};
  if (uploadsSrc) report.uploads = copyTree(uploadsSrc, destDir);
  // legacy files/ (DACP docs) fold under uploads/dacp-legacy to keep one asset root
  if (filesSrc) report.files = copyTree(filesSrc, path.join(destDir, 'dacp-legacy'));
  return report;
}
