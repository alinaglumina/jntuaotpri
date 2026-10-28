import connectDB from '../config/db.js';
import { DirectorateMenuItem } from '../models/index.js';
import mongoose from 'mongoose';
await connectDB();
const r = await DirectorateMenuItem.find({ label: /^\s*approvals?\s*$/i }).lean();
r.forEach(x => console.log('FOUND:', x.label, '| directorateKey:', x.directorateKey, '| menuKey:', x.menuKey, '| parentKey:', x.parentKey, '| type:', x.type));
if (!r.length) console.log('No menu item named Approvals found');
await mongoose.disconnect();
