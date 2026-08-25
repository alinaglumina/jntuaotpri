import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name:      { type: String, required: true },
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'MediaFolder', default: null, index: true },
  createdBy: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('MediaFolder', schema);
