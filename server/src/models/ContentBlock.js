import mongoose from 'mongoose';
// Generic dynamic-content store: reusable, keyed content blocks that pages/
// sections render (hero text, banners, cards, FAQs, arbitrary JSON widgets).
const schema = new mongoose.Schema({
  key:      { type: String, required: true, unique: true, trim: true, index: true }, // 'home.hero', 'footer.about'
  type:     { type: String, enum: ['html', 'text', 'json', 'list', 'image'], default: 'html' },
  page:     { type: String, default: '', index: true },     // which page/section it belongs to
  title:    { type: String, default: '' },
  body:     { type: String, default: '' },                  // HTML/text
  data:     { type: mongoose.Schema.Types.Mixed, default: {} }, // for type=json/list
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  updatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('ContentBlock', schema);
