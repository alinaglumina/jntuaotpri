import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:       { type: String, required: [true, 'Title is required'], trim: true, maxlength: 300 },
  programme:   { type: String, required: true, trim: true },                 // B.Tech, M.Tech, MBA, Ph.D…
  academicYear:{ type: String, default: '', trim: true, match: [/^\d{4}(-\d{2,4})?$/, 'Use YYYY or YYYY-YY'] },
  category:    { type: String, enum: ['UG', 'PG', 'PhD', 'Diploma', 'Other'], default: 'UG', index: true },
  description: { type: String, default: '' },                                // HTML
  openDate:    { type: Date, default: null },
  closeDate:   { type: Date, default: null, index: true },
  applyUrl:    { type: String, default: '' },
  attachment:  { type: String, default: '' },                               // notification PDF
  status:      { type: String, enum: ['open', 'closed', 'upcoming'], default: 'open', index: true },
  isPublished: { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
schema.index({ status: 1, closeDate: -1 });
export default mongoose.model('Admission', schema);
