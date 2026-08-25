import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:        { type: String, required: true, trim: true },
  refNo:        { type: String, default: '' },
  category:     { type: String, default: 'General', index: true },
  circularDate: { type: Date, default: null, index: true },
  attachment:   { type: String, default: '' },
  isNewItem:    { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Circular', schema);
