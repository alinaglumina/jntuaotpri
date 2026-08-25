import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  category:  { type: String, default: 'General', index: true },
  section:   { type: String, default: '', index: true },  // directorate/unit scope
  attachment:{ type: String, default: '' },
  fileType:  { type: String, default: 'pdf' },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Download', schema);
