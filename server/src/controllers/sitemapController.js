import asyncHandler from '../utils/asyncHandler.js';
import { PageContent, News, Notification, Department } from '../models/index.js';
import env from '../config/env.js';

const SITE_URL = (env.siteUrl || env.clientOrigin || 'https://jntua.ac.in').replace(/\/$/, '');

// Core public routes (aggregate pages). Dynamic slugs are appended below.
const STATIC_ROUTES = [
  ['/', 1.0, 'daily'],
  ['/about/genesis', 0.6, 'monthly'], ['/about/vision', 0.6, 'monthly'], ['/about/gallery', 0.5, 'weekly'],
  ['/about/mous', 0.5, 'monthly'], ['/about/e-magazines', 0.5, 'monthly'], ['/about/honoris', 0.4, 'yearly'],
  ['/academics/departments', 0.7, 'monthly'], ['/academics/downloads', 0.6, 'weekly'], ['/academics/regulations', 0.6, 'monthly'],
  ['/notifications', 0.9, 'daily'], ['/examinations', 0.8, 'daily'], ['/admissions', 0.8, 'weekly'],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urlNode = (loc, lastmod, priority, changefreq) =>
  `  <url><loc>${esc(SITE_URL + loc)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}` +
  `${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}<priority>${priority}</priority></url>`;

// GET /sitemap.xml — static routes + dynamic content-derived routes.
export const sitemap = asyncHandler(async (req, res) => {
  const urls = [...STATIC_ROUTES];

  // Freshest content timestamp for lastmod on the busy routes.
  const [latestNews, latestNote, depts, pages] = await Promise.all([
    News.findOne({ isPublished: true }).sort('-createdAt').select('createdAt').lean().catch(() => null),
    Notification.findOne({ isActive: true }).sort('-createdAt').select('createdAt').lean().catch(() => null),
    Department.find().select('code updatedAt').lean().catch(() => []),
    PageContent.find().select('key updatedAt').lean().catch(() => []),
  ]);

  const nodes = urls.map(([loc, pr, cf]) => {
    let lastmod = null;
    if (loc === '/notifications') lastmod = latestNote?.createdAt || latestNews?.createdAt;
    return urlNode(loc, lastmod, pr, cf);
  });

  // Dynamic department pages (if the SPA exposes them by code).
  for (const d of depts) if (d.code) nodes.push(urlNode(`/academics/departments/${String(d.code).toLowerCase()}`, d.updatedAt, 0.5, 'monthly'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes.join('\n')}\n</urlset>\n`;
  res.set('Content-Type', 'application/xml').set('Cache-Control', 'public, max-age=3600').send(xml);
});

// GET /robots.txt — allow crawling, block admin + api, point to the sitemap.
export const robots = (req, res) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /search',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
  res.set('Content-Type', 'text/plain').set('Cache-Control', 'public, max-age=86400').send(body);
};
