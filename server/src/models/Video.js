import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:     { type: String, required: [true, 'Title is required'], trim: true },
  url:       { type: String, required: [true, 'Video URL is required'] },  // YouTube/Vimeo/file
  provider:  { type: String, enum: ['youtube', 'vimeo', 'file'], default: 'youtube' },
  thumbnail: { type: String, default: '' },
  category:  { type: String, default: 'General', index: true },
  description:{ type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Video', schema);
