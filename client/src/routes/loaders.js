// Route loaders — prefetch data into the React Query cache BEFORE the route
// renders, so components mount with data already present (no spinner flash) and
// back/forward navigation is instant. prefetchQuery never throws, so a failed
// fetch degrades to the component's own empty/error state rather than the
// route errorElement.
import { queryClient } from '../lib/queryClient.js';
import {
  slidesQuery, notificationsQuery, galleryQuery, mousQuery,
  emagazinesQuery, honorisQuery, pageContentQuery, adminListQuery, adminPageQuery, facultyQuery,
} from '../api/queries.js';

const prime = (opts) => queryClient.prefetchQuery(opts);

// ── Public ──
export const homeLoader = async () => { await Promise.all([prime(slidesQuery()), prime(notificationsQuery('news'))]); return null; };
export const notificationsLoader = async () => { await prime(notificationsQuery('news')); return null; };
export const galleryLoader     = async () => { await prime(galleryQuery()); return null; };
export const mousLoader        = async () => { await prime(mousQuery()); return null; };
export const emagazinesLoader  = async () => { await prime(emagazinesQuery()); return null; };
export const honorisLoader     = async () => { await prime(honorisQuery()); return null; };
export const facultyLoader     = async () => { await prime(facultyQuery()); return null; };

// Content pages: prefetch the admin-editable override (if any) for this key.
export const contentLoader = (resolveId) => async ({ params }) => {
  const id = resolveId(params);
  if (id) await prime(pageContentQuery(id));
  return null;
};

// ── Admin ──
export const resourceLoader = async ({ params }) => { await prime(adminPageQuery(params.resource, { page: 1, limit: 25 })); return null; };
export const overviewLoader = async () => {
  await Promise.all([adminListQuery('notifications'), adminListQuery('news'), adminListQuery('faculty'), adminListQuery('mous')].map(prime));
  return null;
};
