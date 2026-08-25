import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name:    { type: String, required: [true, 'Name is required'], trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  phone:   { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, required: [true, 'Message is required'], maxlength: 5000 },
  status:  { type: String, enum: ['new', 'read', 'archived'], default: 'new', index: true },
  ip:      { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('ContactMessage', schema);
