import mongoose from 'mongoose';

// A single custom sidebar/nav entry for a directorate's own admin+public menu
// (e.g. "Home", "About", "Syllabus", "Ph.D Scholars admitted", "Research centres").
// type='page'     → body (HTML) is rendered directly, editable in admin like a mini CMS page.
// type='resource' → links to one of the shared directorate-scoped resources (e.g. notifications).
// type='link'     → points to an arbitrary external URL.
const schema = new mongoose.Schema({
  directorateKey: { type: String, required: true, index: true },
  parentKey:      { type: String, default: null },  // menuKey of the parent item, for one level of nested dropdown groups
  label:          { type: String, required: true, trim: true },
  menuKey:        { type: String, required: true, trim: true },   // url-safe slug, unique per directorate
  type:           { type: String, enum: ['page', 'resource', 'link'], default: 'page' },
  body:           { type: String, default: '' },     // HTML, used when type = 'page'
  linkResource:   { type: String, default: '' },      // resource key, used when type = 'resource'
  externalUrl:    { type: String, default: '' },      // used when type = 'link'
  image:          { type: String, default: '' },      // optional photo (e.g. Director/Principal pages)
  attachment1:    { type: String, default: '' },      // optional generic file attachment (e.g. Admissions' Bio-data Form)
  attachment2:    { type: String, default: '' },      // optional second attachment (e.g. Admissions' Undertaking format)
  sortOrder:      { type: Number, default: 0, index: true },
  isActive:       { type: Boolean, default: true },
  updatedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

schema.index({ directorateKey: 1, menuKey: 1 }, { unique: true });

export default mongoose.model('DirectorateMenuItem', schema);
