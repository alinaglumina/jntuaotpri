// Read-only public resource routes. Writes are added per-resource in Phase 5.
// Each list endpoint returns only "active/published" records for guests.
import { Router } from 'express';
import { crudController } from '../controllers/crudController.js';
import {
  GalleryItem, Mou, EMagazine, News, Administration,
  DirectorateContent, HonorisCausa, Slide, Faculty, ExecutiveCouncil, FormerViceChancellor,
  NaacDocument,
} from '../models/index.js';

const router = Router();

// Short public caching for read-only endpoints (browser + CDN/proxy).
router.use((req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

const mount = (path, Model, opts) => {
  const c = crudController(Model, opts);
  router.get(path, c.list);
  router.get(`${path}/:id`, c.getOne);
};

mount('/slides',      Slide,        { defaultSort: 'order',      baseFilter: () => ({ isActive: true }) });
mount('/gallery',     GalleryItem,  { defaultSort: '-uploadedAt', searchable: ['caption', 'category'] });
mount('/mous',        Mou,          { defaultSort: '-mouDate',    baseFilter: () => ({ isActive: true }), searchable: ['orgName'] });
mount('/emagazines',  EMagazine,    { defaultSort: '-issueDate' });
mount('/news',        News,         { defaultSort: '-createdAt',  baseFilter: () => ({ isPublished: true }), searchable: ['title'] });
mount('/honoris',     HonorisCausa, { defaultSort: '-convocationDate' });
mount('/faculty',     Faculty,      { defaultSort: 'sortOrder',    baseFilter: () => ({ isActive: true }), searchable: ['name', 'department', 'designation'] });
mount('/executive-council',       ExecutiveCouncil,     { defaultSort: 'sortOrder', baseFilter: () => ({ isActive: true }), searchable: ['name'] });
mount('/former-vice-chancellors', FormerViceChancellor, { defaultSort: 'sortOrder', baseFilter: () => ({ isActive: true }), searchable: ['name'] });
mount('/administration', Administration, { defaultSort: 'createdAt' });

// NAAC documents table (Extended Profile Metrics, Criteria 1-7, Workshops/Seminars).
// Filtered by ?criteria=<slug> so the public NAAC page shows only its own section's rows.
router.get('/naac-documents', crudController(NaacDocument, {
  defaultSort: 'sortOrder',
  baseFilter: (req) => ({ isActive: true, ...(req.query.criteria ? { criteria: req.query.criteria } : {}) }),
  searchable: ['title'],
}).list);
mount('/directorate-content', DirectorateContent, { defaultSort: 'createdAt' });
router.get('/nav-menu', async (req, res, next) => {
  try {
    const { NavMenuItem } = await import('../models/index.js');
    const items = await NavMenuItem.find({ isActive: true }).sort('order').lean();
    res.json({ success: true, data: items, error: null });
  } catch (e) { next(e); }
});

// Directorate menu items — a directorate's custom nav (Home, About, Syllabus, ...).
router.get('/directorate-menu/:directorateKey', async (req, res, next) => {
  try {
    const { DirectorateMenuItem } = await import('../models/index.js');
    const items = await DirectorateMenuItem.find({ directorateKey: req.params.directorateKey, isActive: true })
      .sort('sortOrder').lean();
    res.json({ success: true, data: items, error: null });
  } catch (e) { next(e); }
});

// Fetch a single administration profile / directorate by its key (used by pages).
router.get('/administration/key/:roleKey', async (req, res, next) => {
  try {
    const doc = await Administration.findOne({ roleKey: req.params.roleKey }).lean();
    res.json({ success: true, data: doc, error: null });
  } catch (e) { next(e); }
});
router.get('/directorate-content/key/:key', async (req, res, next) => {
  try {
    const doc = await DirectorateContent.findOne({ directorateKey: req.params.key }).lean();
    res.json({ success: true, data: doc, error: null });
  } catch (e) { next(e); }
});

export default router;

// Public single page-content by key (admin-published editable pages).
router.get('/page-content/key/:key', async (req, res, next) => {
  try {
    const { PageContent } = await import('../models/index.js');
    const doc = await PageContent.findOne({ key: req.params.key }).lean();
    res.json({ success: true, data: doc, error: null });
  } catch (e) { next(e); }
});

// ── New public content (read-only) ──
import { Event, Download, Circular, Menu } from '../models/index.js';
mount('/events',    Event,    { defaultSort: '-startDate', baseFilter: () => ({ isPublished: true }), searchable: ['title'] });
mount('/downloads', Download, { defaultSort: 'sortOrder',  baseFilter: (req) => ({ isActive: true, ...(req.query.section ? { section: req.query.section } : {}) }),    searchable: ['title', 'category'] });
mount('/circulars', Circular, { defaultSort: '-circularDate', baseFilter: () => ({ isActive: true }), searchable: ['title'] });
mount('/menus',     Menu,     { defaultSort: 'order',      baseFilter: (req) => ({ isActive: true, ...(req.query.location ? { location: req.query.location } : {}) }) });

// ── Admissions / Examinations / Results (read-only) ──
import { Admission, Examination, Result, ContentBlock } from '../models/index.js';
mount('/admissions',   Admission,   { defaultSort: '-closeDate',  baseFilter: () => ({ isPublished: true }), searchable: ['title', 'programme'] });
mount('/examinations', Examination, { defaultSort: '-examDate',   baseFilter: () => ({ isPublished: true }), searchable: ['title'] });
mount('/results',      Result,      { defaultSort: '-publishedOn', baseFilter: () => ({ isPublished: true }), searchable: ['title', 'programme'] });
// Single content block by key (dynamic content for the public site).
router.get('/content-blocks/key/:key', async (req, res, next) => {
  try { const doc = await ContentBlock.findOne({ key: req.params.key, isActive: true }).lean(); res.json({ success: true, data: doc, error: null }); }
  catch (e) { next(e); }
});

// ── CMS public: videos, SEO lookup, contact & enquiry submit ──
import rateLimit from 'express-rate-limit';
import { Video, SeoMeta } from '../models/index.js';
import { submitContact, submitEnquiry } from '../controllers/messagesController.js';
mount('/videos', Video, { defaultSort: 'sortOrder', baseFilter: () => ({ isActive: true }), searchable: ['title'] });
router.get('/seo/key/:path(*)', async (req, res, next) => {
  try { const doc = await SeoMeta.findOne({ path: '/' + req.params.path.replace(/^\/+/, '') }).lean(); res.json({ success: true, data: doc, error: null }); }
  catch (e) { next(e); }
});
const submitLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
router.post('/contact', submitLimiter, submitContact);
router.post('/enquiries', submitLimiter, submitEnquiry);

// ── Public file download with tracking ──
import { downloadMedia } from '../controllers/mediaController.js';
router.get('/media/:id/download', downloadMedia);
