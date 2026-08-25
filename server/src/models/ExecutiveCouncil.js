import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name:        { type: String, required: true },
  designation: { type: String, default: '' },
  photo:       { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0, index: true },
}, { timestamps: true });

export default mongoose.model('ExecutiveCouncil', schema);
