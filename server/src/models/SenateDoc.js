import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:      { type: String, required: true },
  url:        { type: String, default: '' },
  filename:   { type: String, default: '' },
  uploadedBy: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('SenateDoc', schema);
