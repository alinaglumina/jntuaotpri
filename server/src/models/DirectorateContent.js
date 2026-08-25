import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey:      { type: String, required: true, unique: true, index: true },
  directorName:        { type: String, default: '' },
  directorDesignation: { type: String, default: '' },
  directorPhoto:       { type: String, default: '' },
  aboutText:           { type: String, default: '' },   // HTML
  updatedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('DirectorateContent', schema);
