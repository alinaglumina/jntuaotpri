import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  course:     { type: String, default: '' },
  section:    { type: String, default: '', index: true },
  programme:  { type: String, default: '' },
  subType:    { type: String, default: '' },
  regulation: { type: String, default: '' },
  type:       { type: String, default: '' },
  sno:        { type: Number, default: 0 },
  title:      { type: String, required: true },
  filename:   { type: String, default: '' },
  filePath:   { type: String, default: '' },
  fileSize:   { type: String, default: '' },
  isNewItem:  { type: Boolean, default: false }, // legacy is_new
}, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model('DacpFile', schema);
