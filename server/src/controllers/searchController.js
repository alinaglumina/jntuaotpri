import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { SearchLog } from '../models/index.js';
import {
  Notification, News, Download, Faculty, Department, Result,
  PageContent, ContentBlock, DafaDoc, SenateDoc, DacpFile,
} from '../models/index.js';

// Global search across public content. GET /api/search?q=term&limit=6
// Returns results GROUPED by category, each with a friendly label + link.
// `models` may list several collections that roll up into one category
// (e.g. Documents = DafaDoc + SenateDoc + DacpFile).
const CATEGORIES = [
  { type: 'pages', label: 'Pages', icon: 'fa-file-lines',
    sources: [
      { model: PageContent, fields: ['heading', 'key'], title: (d) => d.heading || d.key, sub: () => 'Page', link: (d) => `/search?q=${encodeURIComponent(d.heading || d.key || '')}` },
      { model: ContentBlock, fields: ['heading', 'page', 'body'], title: (d) => d.heading || d.page, sub: (d) => d.page ? `Section · ${d.page}` : 'Section', link: (d) => (d.page ? `/${String(d.page).replace(/^\//, '')}` : '/') },
    ] },
  { type: 'news', label: 'News', icon: 'fa-newspaper',
    sources: [{ model: News, fields: ['title', 'content', 'category'], title: (d) => d.title, sub: (d) => d.category || 'News', link: () => '/notifications' }] },
  { type: 'downloads', label: 'Downloads', icon: 'fa-download',
    sources: [{ model: Download, fields: ['title', 'category', 'section'], title: (d) => d.title, sub: (d) => d.category || 'Download', link: (d) => d.attachment || '/notifications', external: (d) => !!d.attachment }] },
  { type: 'notices', label: 'Notices', icon: 'fa-bell',
    sources: [{ model: Notification, fields: ['title', 'category'], title: (d) => d.title, sub: (d) => d.category || 'Notice', link: () => '/notifications' }] },
  { type: 'faculty', label: 'Faculty', icon: 'fa-user-tie',
    sources: [{ model: Faculty, fields: ['name', 'department', 'designation', 'specialization'], title: (d) => d.name, sub: (d) => [d.designation, d.department].filter(Boolean).join(' · ') || 'Faculty', link: () => '/' }] },
  { type: 'departments', label: 'Departments', icon: 'fa-building-columns',
    sources: [{ model: Department, fields: ['name', 'code', 'hod', 'college'], title: (d) => d.name, sub: (d) => [d.code, d.hod].filter(Boolean).join(' · ') || 'Department', link: (d) => (d.website || '/academics'), external: (d) => !!d.website }] },
  { type: 'documents', label: 'Documents', icon: 'fa-folder-open',
    sources: [
      { model: DafaDoc, fields: ['title', 'section', 'filename'], title: (d) => d.title, sub: (d) => d.section || 'Document', link: (d) => d.url || '#', external: () => true },
      { model: SenateDoc, fields: ['title', 'filename'], title: (d) => d.title, sub: () => 'Senate', link: (d) => d.url || '#', external: () => true },
      { model: DacpFile, fields: ['title', 'course', 'section', 'programme'], title: (d) => d.title, sub: (d) => d.programme || d.course || 'DACP', link: (d) => d.url || '#', external: () => true },
    ] },
  { type: 'results', label: 'Results', icon: 'fa-square-poll-vertical',
    sources: [{ model: Result, fields: ['title', 'regulation', 'programme', 'semester'], title: (d) => d.title, sub: (d) => [d.programme, d.regulation, d.semester].filter(Boolean).join(' · ') || 'Result', link: (d) => d.resultUrl || d.attachment || '/notifications', external: (d) => !!(d.resultUrl || d.attachment) }] },
];

export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit || '6', 10), 20);
  if (q.length < 2) return ok(res, { query: q, groups: [], total: 0 });

  const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }; // escape regex

  const groups = await Promise.all(CATEGORIES.map(async (cat) => {
    // Run each source in the category, merge, cap at `limit`.
    const perSource = await Promise.all(cat.sources.map(async (src) => {
      const filter = { $or: src.fields.map((f) => ({ [f]: rx })) };
      const docs = await src.model.find(filter).limit(limit).lean();
      return docs.map((d) => ({
        id: String(d._id), title: src.title(d) || '(untitled)', subtitle: src.sub?.(d) || '',
        link: src.link(d), external: src.external ? !!src.external(d) : false,
      }));
    }));
    const items = perSource.flat().slice(0, limit);
    return { type: cat.type, label: cat.label, icon: cat.icon, items, count: items.length };
  }));

  const populated = groups.filter((g) => g.count > 0);
  const total = populated.reduce((n, g) => n + g.count, 0);

  // Track the term for "popular searches" — fire-and-forget, never blocks the response.
  if (total > 0) {
    const term = q.toLowerCase().slice(0, 60);
    SearchLog.updateOne({ term }, { $inc: { count: 1 }, $set: { lastAt: new Date() } }, { upsert: true }).catch(() => {});
  }
  return ok(res, { query: q, groups: populated, total });
});

// GET /api/search/popular — top search terms (for the empty search palette).
export const popularSearches = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '6', 10), 12);
  const terms = await SearchLog.find().sort('-count').limit(limit).select('term count').lean();
  return ok(res, { terms: terms.map((t) => t.term) });
});
