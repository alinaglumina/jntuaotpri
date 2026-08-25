import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  code:      { type: String, required: true },   // R18, R21 ...
  sortOrder: { type: Number, default: 0, index: true },
}, { timestamps: true });
export default mongoose.model('Regulation', schema);
