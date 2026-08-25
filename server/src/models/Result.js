import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:       { type: String, required: [true, 'Title is required'], trim: true, maxlength: 300 },
  examination: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', default: null }, // optional link
  regulation:  { type: String, default: '' },
  programme:   { type: String, default: '' },
  semester:    { type: String, default: '' },
  month:       { type: String, default: '' },                              // e.g. 'May 2026'
  resultUrl:   { type: String, default: '' },                              // external results portal link
  attachment:  { type: String, default: '' },
  publishedOn: { type: Date, default: Date.now, index: true },
  isPublished: { type: Boolean, default: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
schema.index({ programme: 1, publishedOn: -1 });
export default mongoose.model('Result', schema);
