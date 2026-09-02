import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  code:        { type: String, default: '' },
  name:        { type: String, required: true },
  programme:   { type: String, default: '' },
  category:    { type: String, default: '' },
  intake:      { type: String, default: '' },
  duration:    { type: String, default: '' },
  eligibility: { type: String, default: '' },
  regulations: { type: String, default: '' },  // attachment URL
  syllabus:    { type: String, default: '' },  // attachment URL
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  meta:        { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('Course', schema);
