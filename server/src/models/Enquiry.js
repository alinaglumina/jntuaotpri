import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name:      { type: String, required: [true, 'Name is required'], trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  phone:     { type: String, default: '' },
  type:      { type: String, enum: ['admission', 'academic', 'general', 'grievance', 'other'], default: 'general', index: true },
  programme: { type: String, default: '' },
  message:   { type: String, required: true, maxlength: 5000 },
  status:    { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new', index: true },
  ip:        { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('Enquiry', schema);
