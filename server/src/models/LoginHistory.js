import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  username:  { type: String, default: '', index: true },
  success:   { type: Boolean, default: true, index: true },
  reason:    { type: String, default: '' },           // failure reason
  ip:        { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: { createdAt: 'at', updatedAt: false } });
schema.index({ user: 1, at: -1 });
export default mongoose.model('LoginHistory', schema);
