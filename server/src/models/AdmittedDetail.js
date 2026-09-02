import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  courseName:     { type: String, required: true, trim: true },
  category:       { type: String, default: '' },
  academicYear:   { type: String, default: '' },
  yearEstablished:{ type: String, default: '' },
  male:           { type: Number, default: 0 },
  female:         { type: Number, default: 0 },
  total:          { type: Number, default: 0 },
  sortOrder:      { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('AdmittedDetail', schema);
