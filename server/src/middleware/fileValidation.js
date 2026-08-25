import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

// Magic-byte signatures for the raster/doc types we accept. Prevents a file
// renamed to .jpg (but actually a script/HTML) from slipping past the extension
// allowlist. Office/zip-based formats share the PK header; text formats are skipped.
const SIGNATURES = {
  '.jpg':  [[0xff, 0xd8, 0xff]],
  '.jpeg': [[0xff, 0xd8, 0xff]],
  '.png':  [[0x89, 0x50, 0x4e, 0x47]],
  '.gif':  [[0x47, 0x49, 0x46, 0x38]],
  '.webp': [[0x52, 0x49, 0x46, 0x46]],       // RIFF (….WEBP)
  '.pdf':  [[0x25, 0x50, 0x44, 0x46]],       // %PDF
  '.mp4':  [[0x66, 0x74, 0x79, 0x70]],       // 'ftyp' at offset 4 (checked loosely)
};

function matches(buf, sigs, ext) {
  if (ext === '.mp4') return buf.slice(4, 8).toString('latin1') === 'ftyp' || buf.slice(4, 8).includes(0x66);
  return sigs.some((sig) => sig.every((b, i) => buf[i] === b));
}

// Reads the first bytes of an uploaded file and rejects extension/content
// mismatches. Best-effort: unknown extensions (docx, csv, etc.) pass through.
export function validateFileContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const sigs = SIGNATURES[ext];
  if (!sigs) return { ok: true, skipped: true };
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    const ok = matches(buf, sigs, ext);
    if (!ok) logger.warn(`[fileValidation] content/extension mismatch for ${path.basename(filePath)}`);
    return { ok };
  } catch { return { ok: true, error: true }; }
}
