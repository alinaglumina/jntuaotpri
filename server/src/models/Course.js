import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  code:      { type: String, default: '' },
  name:      { type: String, required: true },
  programme: { type: String, default: '' },
  duration:  { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('Course', schema);
