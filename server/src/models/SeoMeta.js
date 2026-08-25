import mongoose from 'mongoose';
// Per-route SEO metadata, keyed by path (e.g. '/', '/about/genesis').
const schema = new mongoose.Schema({
  path:        { type: String, required: true, unique: true, trim: true, index: true },
  title:       { type: String, default: '' },
  description: { type: String, default: '', maxlength: 320 },
  keywords:    { type: String, default: '' },
  ogImage:     { type: String, default: '' },
  canonical:   { type: String, default: '' },
  noindex:     { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('SeoMeta', schema);
