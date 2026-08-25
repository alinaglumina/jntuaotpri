import mongoose from 'mongoose';
// Covers legacy directorate student lists (B.Tech students, foreign students,
// gold medalists, distinguished alumni…) via the `category` discriminator.
const schema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  rollNo:    { type: String, default: '', index: true },
  programme: { type: String, default: '' },
  branch:    { type: String, default: '' },
  year:      { type: String, default: '' },
  category:  { type: String, default: 'general', index: true }, // btech|foreign|gold-medal|alumni…
  email:     { type: String, default: '' },
  photo:     { type: String, default: '' },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('Student', schema);
