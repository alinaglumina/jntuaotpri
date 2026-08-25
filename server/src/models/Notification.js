import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:      { type: String, required: true, trim: true },
  publishedAt: { type: Date, default: Date.now },
  category:   { type: [String], enum: ['news','live-news','exam','admission','research','placement','sports','tenders'], default: ['news'], index: true },
  attachments: { type: [String], default: [] },
  attachmentsNames: { type: [String], default: [] },  // original uploaded filenames, matching attachments by index
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Notification', schema);
