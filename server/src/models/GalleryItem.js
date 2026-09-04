import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  eventName:  { type: String, required: true, trim: true },
  images:     { type: [String], default: [] },  // 1–10 images per event
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: true } });
export default mongoose.model('GalleryItem', schema);
