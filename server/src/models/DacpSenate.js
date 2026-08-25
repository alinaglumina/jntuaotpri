import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title:      { type: String, required: true },
  academicYr: { type: String, default: '' },
  filePath:   { type: String, default: '' },
  isNewItem:  { type: Boolean, default: false }, // legacy is_new
}, { timestamps: true });
export default mongoose.model('DacpSenate', schema);
