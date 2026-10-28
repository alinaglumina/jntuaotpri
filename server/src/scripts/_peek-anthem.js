import connectDB from '../config/db.js';
import { DirectorateMenuItem } from '../models/index.js';
import mongoose from 'mongoose';
await connectDB();
const r = await DirectorateMenuItem.find({ label: /anthem/i }).lean();
r.forEach(x => console.log('ITEM:', x.label, '| menuKey:', x.menuKey, '| type:', x.type, '| externalUrl:', x.externalUrl, '| attachment1:', x.attachment1, '| body:', (x.body||'').slice(0,120)));
if (!r.length) console.log('none found');
await mongoose.disconnect();
