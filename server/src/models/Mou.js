import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  orgName:   { type: String, required: true, trim: true },
  mouType:   { type: String, enum: ['National','International'], default: 'National', index: true },
  document:  { type: String, default: '' },
  mouDate:   { type: Date, default: null },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Mou', schema);
