import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  roleKey:     { type: String, required: true, unique: true },  // chancellor|vc|rector|registrar
  name:        { type: String, required: true },
  designation: { type: String, required: true },
  photo:       { type: String, default: '' },
  profileText: { type: String, default: '' },   // HTML
  attachment:  { type: String, default: '' },   // Profile PDF/document
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Administration', schema);
