import mongoose from 'mongoose';
// Exam notifications / schedules (time-tables, fee notifications, revaluation…).
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:       { type: String, required: [true, 'Title is required'], trim: true, maxlength: 300 },
  examType:    { type: String, enum: ['Regular', 'Supplementary', 'Revaluation', 'Recounting', 'Fee', 'TimeTable', 'Other'], default: 'Regular', index: true },
  regulation:  { type: String, default: '' },                               // R18, R21…
  programme:   { type: String, default: '' },
  semester:    { type: String, default: '' },
  examDate:    { type: Date, default: null, index: true },
  lastDate:    { type: Date, default: null },                               // last date to apply/pay
  attachment:  { type: String, default: '' },
  notes:       { type: String, default: '' },                              // HTML
  isPublished: { type: Boolean, default: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
schema.index({ examType: 1, examDate: -1 });
export default mongoose.model('Examination', schema);
