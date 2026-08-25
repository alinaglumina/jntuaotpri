import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a local file to Cloudinary under jntuaweb/<subfolder>, then returns
// its permanent URL + public_id (needed later to delete/replace the asset).
export async function uploadToCloudinary(localPath, subfolder) {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: `jntuaweb/${subfolder}`,
    resource_type: 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }); }
  catch { /* already gone or not a cloudinary asset */ }
}

export default cloudinary;
