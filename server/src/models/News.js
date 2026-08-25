import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:       { type: String, required: true, trim: true },
  content:     { type: String, default: '' },   // HTML from Quill — sanitize on render
  category:    { type: String, default: 'General' },
  attachment:  { type: String, default: '' },
  isPublished: { type: Boolean, default: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('News', schema);
