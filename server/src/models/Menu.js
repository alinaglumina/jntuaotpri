import mongoose from 'mongoose';
// Dynamic, CMS-managed navigation. `location` groups menus (header/footer/quick).
const schema = new mongoose.Schema({
  label:    { type: String, required: true },
  url:      { type: String, default: '' },
  location: { type: String, default: 'header', index: true }, // header|footer|quick
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null, index: true },
  target:   { type: String, enum: ['_self', '_blank'], default: '_self' },
  order:    { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Menu', schema);
