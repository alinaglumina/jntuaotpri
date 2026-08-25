import mongoose from 'mongoose';

const CRITERIA_OPTIONS = [
  'extended-profile', 'criteria-1', 'criteria-2', 'criteria-3', 'criteria-4',
  'criteria-5', 'criteria-6', 'criteria-7', 'workshops-seminars', 'ssr',
];

const schema = new mongoose.Schema({
  criteria:   { type: String, required: true, enum: CRITERIA_OPTIONS, index: true },
  metricNumber: { type: String, default: '', trim: true },  // e.g. "1.1", "1.2"
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  sortOrder:  { type: Number, default: 0, index: true },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('NaacDocument', schema);
