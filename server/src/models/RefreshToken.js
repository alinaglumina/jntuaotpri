import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedByHash: { type: String, default: null },   // set on rotation
  userAgent: { type: String, default: '' },
  ip:        { type: String, default: '' },
}, { timestamps: true });
// TTL index — Mongo purges expired tokens automatically.
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.virtual('isActive').get(function () { return !this.revokedAt && this.expiresAt > new Date(); });
export default mongoose.model('RefreshToken', schema);
