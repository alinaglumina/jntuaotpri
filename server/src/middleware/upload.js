import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const ALLOWED = ['.pdf','.doc','.docx','.jpg','.jpeg','.png','.gif','.webp','.svg','.bmp','.mp4','.webm','.mov','.avi','.mkv','.xls','.xlsx','.ppt','.pptx','.csv','.txt','.rtf','.odt','.ods','.zip'];

function storageFor(subdir = 'documents') {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(process.cwd(), env.upload.dir, subdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      cb(null, unique);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED.includes(ext)) return cb(new ApiError(400, `File type not allowed: ${ext}`));
  cb(null, true);
}

// Returns a configured multer instance targeting uploads/<subdir>/.
export function uploader(subdir) {
  return multer({ storage: storageFor(subdir), fileFilter, limits: { fileSize: env.upload.maxBytes } });
}

// Turns a stored file into a public URL path.
export function publicUrl(subdir, filename) {
  return `${env.upload.assetBase}/${env.upload.dir}/${subdir}/${filename}`;
}
