import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  folderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'MediaFolder', default: null, index: true },
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true },
  ext:          { type: String, default: '' },
  mimeType:     { type: String, default: '' },
  fileType:     { type: String, default: 'other', index: true }, // image|pdf|document|video...
  size:         { type: Number, default: 0 },
  module:       { type: String, default: '' },
  description:  { type: String, default: '' },
  url:          { type: String, default: '' },
  storagePath:  { type: String, default: '' },
  cloudinaryId: { type: String, default: '' },
  uploadedBy:   { type: String, default: '' },
  downloadCount:{ type: Number, default: 0, index: true },
  lastDownloadedAt: { type: Date, default: null },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: true } });
export default mongoose.model('MediaFile', schema);
