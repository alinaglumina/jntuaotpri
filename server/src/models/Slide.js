import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  image:   { type: String, required: true },
  badge:   { type: String, default: '' },
  title:   { type: String, default: '' },
  subtext: { type: String, default: '' },
  order:   { type: Number, default: 0, index: true },
  isActive:{ type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Slide', schema);
