// One-time seed: copies the CURRENT hardcoded header menu (everything except
// "Directorates", which stays static/code-driven) into the database so the
// header renders identically after switching to admin-editable menus.
// Safe to re-run — upserts by `key`, never duplicates.
// Run: node src/scripts/seedNavMenu.js
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import { NavMenuItem } from '../models/index.js';
import mongoose from 'mongoose';

const ITEMS = [
  // Home (direct link, no children)
  { key: 'home', parentKey: null, label: 'Home', to: '/', order: 0 },

  // About
  { key: 'about', parentKey: null, label: 'About', to: '', order: 1 },
  { key: 'about-genesis', parentKey: 'about', label: 'Genesis-JNTUA', to: '/about/genesis', order: 0 },
  { key: 'about-vision-mission', parentKey: 'about', label: 'Vision & Mission', to: '/about/vision-mission', order: 1 },
  { key: 'about-goals', parentKey: 'about', label: 'University Goals', to: '/about/goals', order: 2 },
  { key: 'about-policies', parentKey: 'about', label: 'JNTUA Policies', to: '/about/policies', order: 3 },
  { key: 'about-honoris', parentKey: 'about', label: 'Honoris Causa', to: '/about/honoris', order: 4 },
  { key: 'about-gallery', parentKey: 'about', label: 'JNTUA Gallery', to: '/about/gallery', order: 5 },
  { key: 'about-mous', parentKey: 'about', label: "Tie Up's & MOU's", to: '/about/mous', order: 6 },
  { key: 'about-emagazines', parentKey: 'about', label: 'E-Magazines', to: '/about/e-magazines', order: 7 },
  { key: 'about-anthem', parentKey: 'about', label: 'JNTUA Anthem', to: '/about/anthem', order: 8 },

  // Administration
  { key: 'administration', parentKey: null, label: 'Administration', to: '', order: 2 },
  { key: 'admin-chancellor', parentKey: 'administration', label: 'Chancellor', to: '/administration/chancellor', order: 0 },
  { key: 'admin-vc', parentKey: 'administration', label: 'Vice-Chancellor', to: '/administration/vice-chancellor', order: 1 },
  { key: 'admin-rector', parentKey: 'administration', label: 'Rector', to: '/administration/rector', order: 2 },
  { key: 'admin-registrar', parentKey: 'administration', label: 'Registrar', to: '/administration/registrar', order: 3 },
  { key: 'admin-exec-council', parentKey: 'administration', label: 'Executive Council', to: '/administration/executive-council', order: 4 },
  { key: 'admin-former-vcs', parentKey: 'administration', label: 'Former Vice-Chancellors', to: '/administration/former-vice-chancellors', order: 5 },

  // Assessment & Accreditation (order=4, leaving 3 reserved for the static Directorates group)
  { key: 'assessment', parentKey: null, label: 'Assessment & Accreditation', to: '', order: 4 },
  { key: 'assessment-iqac', parentKey: 'assessment', label: 'IQAC', to: '', order: 0 },
  { key: 'aa-iqac-about', parentKey: 'assessment-iqac', label: 'About IQAC', to: '/assessment/iqac/about', order: 0 },
  { key: 'aa-iqac-functions', parentKey: 'assessment-iqac', label: 'Functions of IQAC', to: '/assessment/iqac/functions', order: 1 },
  { key: 'aa-iqac-benefits', parentKey: 'assessment-iqac', label: 'Benefits of IQAC', to: '/assessment/iqac/benefits', order: 2 },
  { key: 'aa-iqac-initiatives', parentKey: 'assessment-iqac', label: 'Important Initiatives started at JNTUA', to: '/assessment/iqac/initiatives', order: 3 },
  { key: 'assessment-aishe', parentKey: 'assessment', label: 'AISHE', to: '', order: 1 },
  { key: 'aa-aishe-jntua', parentKey: 'assessment-aishe', label: 'JNTUA AISHE', to: '/assessment/aishe/jntua', order: 0 },
  { key: 'aa-aishe-reports', parentKey: 'assessment-aishe', label: 'AISHE Reports', to: '/assessment/aishe/reports', order: 1 },
  { key: 'assessment-nirf', parentKey: 'assessment', label: 'NIRF', to: '', order: 2 },
  { key: 'aa-nirf-jntua', parentKey: 'assessment-nirf', label: 'JNTUA NIRF', to: '/assessment/nirf/jntua', order: 0 },
  { key: 'aa-nirf-reports', parentKey: 'assessment-nirf', label: 'NIRF Reports', to: '/assessment/nirf/reports', order: 1 },

  // NAAC
  { key: 'naac', parentKey: null, label: 'NAAC', to: '', order: 5 },
  { key: 'naac-extended-profile', parentKey: 'naac', label: 'Extended Profile Metrics', to: '/naac/extended-profile', order: 0 },
  { key: 'naac-criteria-1', parentKey: 'naac', label: 'Criteria 1', to: '/naac/criteria-1', order: 1 },
  { key: 'naac-criteria-2', parentKey: 'naac', label: 'Criteria 2', to: '/naac/criteria-2', order: 2 },
  { key: 'naac-criteria-3', parentKey: 'naac', label: 'Criteria 3', to: '/naac/criteria-3', order: 3 },
  { key: 'naac-criteria-4', parentKey: 'naac', label: 'Criteria 4', to: '/naac/criteria-4', order: 4 },
  { key: 'naac-criteria-5', parentKey: 'naac', label: 'Criteria 5', to: '/naac/criteria-5', order: 5 },
  { key: 'naac-criteria-6', parentKey: 'naac', label: 'Criteria 6', to: '/naac/criteria-6', order: 6 },
  { key: 'naac-criteria-7', parentKey: 'naac', label: 'Criteria 7', to: '/naac/criteria-7', order: 7 },
  { key: 'naac-workshops', parentKey: 'naac', label: 'Workshops / Seminars', to: '/naac/workshops-seminars', order: 8 },
  { key: 'naac-ssr', parentKey: 'naac', label: 'Self Study Report (SSR)', to: '/naac/ssr', order: 9 },

  // Academics
  { key: 'academics', parentKey: null, label: 'Academics', to: '', order: 6 },
  { key: 'acad-methodology', parentKey: 'academics', label: 'Methodology', to: '/academics/methodology', order: 0 },
  { key: 'acad-admission', parentKey: 'academics', label: 'Admission', to: '/academics/admission', order: 1 },
  { key: 'acad-regsyllabus', parentKey: 'academics', label: 'Regulations & Syllabus', to: '/academics/regulations-syllabus', order: 2 },
  { key: 'acad-examinations', parentKey: 'academics', label: 'Examinations', to: '/academics/examinations', order: 3 },
  { key: 'acad-downloads', parentKey: 'academics', label: 'Downloadable Documents', to: '/academics/downloads', order: 4 },
  { key: 'acad-examcal', parentKey: 'academics', label: 'Exam Calendars', to: '/academics/exam-calendars', order: 5 },
  { key: 'acad-affiliated', parentKey: 'academics', label: 'Affiliated Colleges', to: '/academics/affiliated-colleges', order: 6 },

  // Important Units
  { key: 'units', parentKey: null, label: 'Important Units', to: '', order: 7 },
  { key: 'unit-nss', parentKey: 'units', label: 'NSS Cell', to: '/units/nss', order: 0 },
  { key: 'unit-scst', parentKey: 'units', label: 'SC/ST Cell', to: '/units/scst', order: 1 },
  { key: 'unit-anti-ragging', parentKey: 'units', label: 'Anti-Ragging Cell', to: '/units/anti-ragging', order: 2 },
  { key: 'unit-pro', parentKey: 'units', label: 'Public Relations Office', to: '/units/public-relations', order: 3 },
  { key: 'unit-sports', parentKey: 'units', label: 'Sports Council', to: '/units/sports', order: 4 },
];

async function run() {
  await connectDB();
  for (const item of ITEMS) {
    await NavMenuItem.updateOne(
      { key: item.key },
      { $setOnInsert: { ...item, isActive: true, wide: false } },
      { upsert: true }
    );
  }
  logger.info(`Seeded ${ITEMS.length} nav menu items.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { logger.error(e); process.exit(1); });
