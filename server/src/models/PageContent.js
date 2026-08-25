import mongoose from 'mongoose';
// Admin-editable page bodies (from legacy dafa_pages.json). The public site
// prefers this over the static content manifest when a matching key exists.
const schema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true, index: true }, // e.g. 'nss-about'
  heading: { type: String, default: '' },
  body:    { type: String, default: '' }, // HTML
  updatedBy: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('PageContent', schema);
