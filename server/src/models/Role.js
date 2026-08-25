import mongoose from 'mongoose';
// A named role with a set of permission strings (see config/permissions.js).
const schema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  label:       { type: String, default: '' },
  permissions: { type: [String], default: [] },   // e.g. ['notifications:write', 'users:manage']
  isSystem:    { type: Boolean, default: false },  // system roles can't be deleted
}, { timestamps: true });
export default mongoose.model('Role', schema);
