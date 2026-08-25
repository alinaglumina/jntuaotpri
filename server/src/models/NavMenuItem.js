import mongoose from 'mongoose';

// Drives the public header mega-menu (all groups EXCEPT "Directorates", which
// stays static and is merged in by the frontend at render time).
// key/parentKey form a self-referencing tree: parentKey=null → top-level group
// or a direct link (e.g. "Home"); items can nest up to 2 levels deep (matching
// Assessment & Accreditation's IQAC/AISHE/NIRF sub-groups).
const schema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true, trim: true },
  parentKey:  { type: String, default: null, index: true },
  label:      { type: String, required: true, trim: true },
  to:         { type: String, default: '' },   // set for leaves; groups leave this blank
  order:      { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  wide:       { type: Boolean, default: false }, // top-level dropdown width, matches old NAV "wide" flag
  updatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.model('NavMenuItem', schema);
