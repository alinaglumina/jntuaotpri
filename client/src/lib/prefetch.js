// Prefetch-on-hover engine. Warms (a) the React Query cache with the same query
// a route's loader would run, and (b) the route's lazy JS chunk. When the user
// then clicks, the loader finds fresh cache and the chunk is already downloaded,
// so navigation is instant. All prefetches are deduped and best-effort.
import { queryClient } from './queryClient.js';
import * as Q from '../api/queries.js';
import { NAV, DIRECTORATES, UNITS } from '../content/nav.js';

// path → content-manifest id (for fixed content pages).
const pathToContentId = {};
NAV.forEach((g) => (g.children || []).forEach((l) => { if (l.kind === 'content' && l.id) pathToContentId[l.to] = l.id; }));

const dirId = (key) => (DIRECTORATES.find(([, , s]) => s === key) || [])[0];
const unitId = (key) => (UNITS.find(([, , s]) => s === key) || [])[0];

// Returns the query definitions to warm for a given path (mirrors routes/loaders.js).
function queriesFor(path) {
  if (path === '/') return [Q.slidesQuery(), Q.notificationsQuery('news')];
  if (path === '/notifications') return [Q.notificationsQuery('news')];
  if (path === '/about/gallery') return [Q.galleryQuery()];
  if (path === '/about/mous') return [Q.mousQuery()];
  if (path === '/about/e-magazines') return [Q.emagazinesQuery()];
  if (path === '/about/honoris') return [Q.honorisQuery()];
  if (path.startsWith('/directorates/')) { const id = dirId(path.split('/')[2]); return id ? [Q.pageContentQuery(id)] : []; }
  if (path.startsWith('/units/')) { const id = unitId(path.split('/')[2]); return id ? [Q.pageContentQuery(id)] : []; }
  if (pathToContentId[path]) return [Q.pageContentQuery(pathToContentId[path])];
  if (path.startsWith('/admin/r/')) return [Q.adminListQuery(path.split('/')[3], undefined)];
  return [];
}

// Lazy chunk warmers — calling the same import() Vite uses populates the module
// cache so the component is ready on click. Best-effort; unknown paths skip.
const chunkWarmers = {
  '/': () => import('../pages/Home.jsx'),
  '/notifications': () => import('../pages/NotificationCentre.jsx'),
  '/about/gallery': () => import('../pages/Gallery.jsx'),
  '/about/mous': () => import('../pages/Mous.jsx'),
  '/about/e-magazines': () => import('../pages/EMagazines.jsx'),
  '/about/honoris': () => import('../pages/Honoris.jsx'),
  '/admin': () => import('../admin/Dashboard.jsx'),
  '/admin/media': () => import('../admin/MediaLibrary.jsx'),
  '/admin/users': () => import('../admin/Users.jsx'),
  '/admin/roles': () => import('../admin/RolesPermissions.jsx'),
  '/admin/settings': () => import('../admin/Settings.jsx'),
  '/admin/logs': () => import('../admin/AuditLogs.jsx'),
  '/admin/backup': () => import('../admin/Backup.jsx'),
  '/admin/messages': () => import('../admin/MessagesInbox.jsx'),
  '/admin/enquiries': () => import('../admin/MessagesInbox.jsx'),
  '/admin/page-builder': () => import('../admin/PageBuilder.jsx'),
  '/admin/menus-manager': () => import('../admin/MenuManager.jsx'),
  '/admin/profile': () => import('../admin/Profile.jsx'),
  '/admin/login-history': () => import('../admin/LoginHistory.jsx'),
};
function warmChunk(path) {
  if (chunkWarmers[path]) return chunkWarmers[path]();
  if (path.startsWith('/directorates/') || path.startsWith('/units/') || pathToContentId[path]) return import('../components/ContentPage.jsx');
  if (path.startsWith('/admin/r/')) return import('../admin/CrudSection.jsx');
  return null;
}

const seen = new Set();   // dedupe so we only prefetch a path once per session

export function prefetchPath(path) {
  if (!path || seen.has(path)) return;
  seen.add(path);
  // Data: staleTime keeps it cached so the loader resolves instantly.
  for (const q of queriesFor(path)) queryClient.prefetchQuery({ ...q, staleTime: 30_000 });
  // Chunk: fire the dynamic import (ignore failures — it's an optimization).
  try { warmChunk(path); } catch { /* noop */ }
}
