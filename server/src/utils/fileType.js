// Maps an extension/mime to a friendly category used for icons + preview routing.
const MAP = {
  image:   ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
  pdf:     ['pdf'],
  word:    ['doc', 'docx', 'odt', 'rtf'],
  excel:   ['xls', 'xlsx', 'ods', 'csv'],
  powerpoint: ['ppt', 'pptx'],
  video:   ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  text:    ['txt'],
};
export function categorize(ext = '', mime = '') {
  const e = ext.replace('.', '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  for (const [cat, exts] of Object.entries(MAP)) if (exts.includes(e)) return cat;
  return 'other';
}
