import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name:        { type: String, required: true },
  tenure:      { type: String, default: '' },
  photo:       { type: String, default: '' },
  profileText: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0, index: true },
}, { timestamps: true });

export default mongoose.model('FormerViceChancellor', schema);
