import mongoose from 'mongoose';
// Aggregated search terms → powers "popular searches". One doc per normalized term.
const schema = new mongoose.Schema({
  term:  { type: String, required: true, unique: true, index: true },
  count: { type: Number, default: 1 },
  lastAt:{ type: Date, default: Date.now },
}, { timestamps: true });
export default mongoose.model('SearchLog', schema);
