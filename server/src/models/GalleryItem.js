import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  filename:   { type: String, required: true },
  caption:    { type: String, default: '' },
  category:   { type: String, default: 'General', index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: true } });
export default mongoose.model('GalleryItem', schema);
