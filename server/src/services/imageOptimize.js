import path from 'path';
import logger from '../utils/logger.js';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_WIDTH = 1600;   // downscale oversized uploads
const QUALITY = 80;

// Compress + downscale an uploaded image IN PLACE. Best-effort: if sharp isn't
// available or the file isn't a raster image, it silently leaves the file as-is
// (uploads never fail because of optimization).
export async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return { optimized: false, reason: 'not-raster' };
  let sharp;
  try { sharp = (await import('sharp')).default; }
  catch { logger.warn('[imageOptimize] sharp unavailable — skipping compression'); return { optimized: false, reason: 'no-sharp' }; }

  try {
    const fs = await import('fs/promises');
    const input = await fs.readFile(filePath);
    let pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === '.png') pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    else if (ext === '.webp') pipeline = pipeline.webp({ quality: QUALITY });
    else pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    const out = await pipeline.toBuffer();
    if (out.length < input.length) { await fs.writeFile(filePath, out); return { optimized: true, saved: input.length - out.length }; }
    return { optimized: false, reason: 'no-gain' };
  } catch (e) { logger.warn(`[imageOptimize] failed: ${e.message}`); return { optimized: false, reason: 'error' }; }
}
