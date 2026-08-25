import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title:    { type: String, required: true },
  period:   { type: String, default: '' },
  filePath: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('DacpNewsletter', schema);
