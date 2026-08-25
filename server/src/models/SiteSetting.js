import mongoose from 'mongoose';
// Key/value store mirroring the legacy site_settings table.
const schema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('SiteSetting', schema);
