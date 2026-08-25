import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  name:           { type: String, required: true },
  designation:    { type: String, default: '' },
  department:     { type: String, default: '', index: true },
  qualification:  { type: String, default: '' },
  specialization: { type: String, default: '' },
  experience:     { type: String, default: '' },
  email:          { type: String, default: '' },
  mobile:         { type: String, default: '' },
  researchArea:   { type: String, default: '' },
  publications:   { type: String, default: '' },
  achievements:   { type: String, default: '' },
  photo:          { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  sortOrder:      { type: Number, default: 0, index: true },
}, { timestamps: true });
export default mongoose.model('Faculty', schema);
