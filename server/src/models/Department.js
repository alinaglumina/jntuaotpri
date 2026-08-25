import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  code:        { type: String, default: '', index: true },
  college:     { type: String, default: '' },        // constituent college / school
  hod:         { type: String, default: '' },
  description: { type: String, default: '' },         // HTML
  website:     { type: String, default: '' },
  email:       { type: String, default: '' },
  sortOrder:   { type: Number, default: 0, index: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Department', schema);
