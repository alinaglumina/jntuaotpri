import mongoose from 'mongoose';
import { softDeletePlugin } from './softDelete.js';

// Global plugin — applies soft-delete to every schema. Registered before any
// model is compiled (imported first in models/index.js). Append-only
// collections (AuditLog) and key/value stores (SiteSetting) simply never set
// the flag, so the behaviour is inert for them.
mongoose.plugin(softDeletePlugin);
