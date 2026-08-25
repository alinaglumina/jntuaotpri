// Seeds a super admin + core site settings so the app is usable immediately.
// Real content arrives via the Phase 4 ETL. Run: npm run seed
import connectDB from '../config/db.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { User, SiteSetting, Administration, Role } from '../models/index.js';
import { SYSTEM_ROLES } from '../config/permissions.js';
import mongoose from 'mongoose';

const SETTINGS = {
  university_name: 'Jawaharlal Nehru Technological University Anantapur',
  vc_name: 'Prof. H. Sudarsana Rao',
  contact_phone: '+91-8554-272475',
  contact_email: 'registrar@jntua.ac.in',
  facebook_url: 'https://facebook.com/jntua',
  twitter_url: 'https://twitter.com/jntua',
  linkedin_url: 'https://linkedin.com/school/jntua',
  youtube_url: 'https://youtube.com/jntua',
};

async function run() {
  await connectDB();
  const existing = await User.findOne({ username: env.seed.user });
  if (!existing) {
    await User.create({
      username: env.seed.user,
      email: env.seed.email,
      passwordHash: await User.hashPassword(env.seed.pass),
      fullName: 'Super Administrator',
      role: 'admin',
    });
    logger.info(`Seeded super admin '${env.seed.user}' (change the password after first login).`);
  } else {
    logger.info('Super admin already exists — skipping.');
  }

  for (const [key, value] of Object.entries(SETTINGS)) {
    await SiteSetting.updateOne({ key }, { $setOnInsert: { value } }, { upsert: true });
  }
  for (const a of [
    { roleKey: 'chancellor', name: 'H.E. the Governor of AP', designation: 'Chancellor, JNTUA' },
    { roleKey: 'vc',         name: 'Prof. H. Sudarsana Rao',  designation: 'Vice Chancellor, JNTUA' },
    { roleKey: 'rector',     name: '',                        designation: 'Rector, JNTUA' },
    { roleKey: 'registrar',  name: '',                        designation: 'Registrar, JNTUA' },
  ]) {
    await Administration.updateOne({ roleKey: a.roleKey }, { $setOnInsert: a }, { upsert: true });
  }
  for (const [name, def] of Object.entries(SYSTEM_ROLES)) {
    await Role.updateOne({ name }, { $setOnInsert: { name, ...def } }, { upsert: true });
  }
  logger.info(`Seeded ${Object.keys(SYSTEM_ROLES).length} system roles.`);
  logger.info('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { logger.error(e); process.exit(1); });
