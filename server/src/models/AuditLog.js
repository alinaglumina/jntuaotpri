import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  actor:      { type: String, default: 'system', index: true },   // username
  action:     { type: String, index: true },                      // create|update|delete|login|logout
  resource:   { type: String, default: '', index: true },
  resourceId: { type: String, default: '' },
  method:     { type: String, default: '' },
  path:       { type: String, default: '' },
  status:     { type: Number, default: 0 },
  ip:         { type: String, default: '' },
  meta:       { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: 'at', updatedAt: false } });
schema.index({ at: -1 });
export default mongoose.model('AuditLog', schema);
