import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL; // e.g. https://pub-xxxx.r2.dev or your custom domain, no trailing slash

// Uploads a local file to R2 under jntuaweb/<subfolder>/, then returns its
// permanent public URL + object key (needed later to delete/replace the asset).
// Mirrors uploadToCloudinary's signature exactly so callers need no changes.
export async function uploadToR2(localPath, subfolder) {
  const ext = path.extname(localPath);
  const key = `jntuaweb/${subfolder}/${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

  // Stream the file instead of reading it fully into memory — critical for
  // large uploads (videos, big PDFs) on memory-constrained hosting like Render.
  const stream = fs.createReadStream(localPath);
  const uploader = new Upload({
    client: r2,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: stream,
      ContentType: guessContentType(ext),
    },
    queueSize: 4,
    partSize: 8 * 1024 * 1024, // 8MB multipart chunks
  });

  await uploader.done();

  return { url: `${PUBLIC_BASE}/${key}`, publicId: key };
}

// Generates a short-lived presigned PUT URL so large files can be uploaded
// DIRECTLY from the browser to R2, bypassing the app server entirely — this
// avoids platform request timeouts (e.g. Render) for big files (videos, PDFs).
export async function getPresignedUploadUrl(subfolder, originalFilename, contentType) {
  const ext = path.extname(originalFilename);
  const key = `jntuaweb/${subfolder}/${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType || guessContentType(ext),
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 minutes
  return { uploadUrl, publicUrl: `${PUBLIC_BASE}/${key}`, key };
}

export async function deleteFromR2(key) {
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch { /* already gone or invalid key */ }
}

function guessContentType(ext) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bmp': 'image/bmp',
    '.pdf': 'application/pdf', '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.csv': 'text/csv', '.txt': 'text/plain', '.zip': 'application/zip',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}
