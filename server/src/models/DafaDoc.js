import mongoose from 'mongoose';
// One collection replacing the 30+ per-section JSON files. `section` is the
// discriminator key (e.g. 'otpri-committees', 'drd-syllabus-r21'). `meta`
// holds section-specific fields that varied across the old JSON stores.
const schema = new mongoose.Schema({
  section:   { type: String, required: true, index: true },
  title:     { type: String, default: '' },
  url:       { type: String, default: '' },
  filename:  { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('DafaDoc', schema);
