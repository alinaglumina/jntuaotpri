import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },   // HTML
  category:    { type: String, default: 'General', index: true },
  startDate:   { type: Date, required: true, index: true },
  endDate:     { type: Date, default: null },
  venue:       { type: String, default: '' },
  banner:      { type: String, default: '' },
  images:      { type: [String], default: [] },  // homepage slider gallery (4+ images)
  registrationUrl: { type: String, default: '' },
  isPublished: { type: Boolean, default: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Event', schema);
