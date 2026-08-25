import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title:    { type: String, required: true },
  circDate: { type: Date, default: null },
  filePath: { type: String, default: '' },
  isNewItem: { type: Boolean, default: false }, // legacy is_new
}, { timestamps: true });
export default mongoose.model('DacpCircular', schema);
