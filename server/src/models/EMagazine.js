import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  monthYear:  { type: String, required: true },      // 'May 2026'
  issueDate:  { type: Date, required: true, index: true },
  filename:   { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: true } });
export default mongoose.model('EMagazine', schema);
