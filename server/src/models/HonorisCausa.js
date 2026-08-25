import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name:            { type: String, required: true },
  convocationDate: { type: Date, default: null },
  honorDegree:     { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('HonorisCausa', schema);
