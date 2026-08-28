import { useParams, useSearchParams } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import ContentPage from './ContentPage.jsx';
import SafeHtml from './SafeHtml.jsx';
import HeroSlider from './HeroSlider.jsx';
import FacultyTable from './FacultyTable.jsx';
import directorates from '../content/directorates.json';
import { useDirectorateMenu, useSlides } from '../api/public.js';
import { useQuery } from '@tanstack/react-query';
import { directorateContentQuery } from '../api/queries.js';
import { buildDynamicTabs, flattenLeaves } from '../utils/directorateTabs.js';

function Avatar({ name, role }) {
  const source = name || role || '?';
  const initials = source
    .replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white">
      {initials}
    </div>
  );
}

function DynamicTabContent({ item }) {
  // Special-cased faculty listing tables (Academics > Faculty > Pharmacy /
  // Food Technology), keyed by menuKey rather than a generic content type.
  if (item.menuKey === 'faculty-pharmacy') return <FacultyTable department="Pharmacy" />;
  if (item.menuKey === 'faculty-food-technology') return <FacultyTable department="Food Technology" />;
  if (item.type === 'page') {
    return item.body ? <SafeHtml html={item.body} /> : <p className="text-slate-500">Content coming soon.</p>;
  }
  if (item.type === 'link') {
    return item.externalUrl ? (
      <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90">
        Open {item.label} <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
      </a>
    ) : <p className="text-slate-500">Link not set yet.</p>;
  }
  if (item.type === 'resource' && item.linkResource) {
    return (
      <p className="text-slate-700">
        See <a href={`/${item.linkResource}`} className="font-semibold text-crimson hover:underline">{item.label}</a> for this directorate.
      </p>
    );
  }
  return <p className="text-slate-500">Details will be published soon.</p>;
}

function Blocks({ blocks }) {
  if (!blocks || blocks.length === 0) return <p className="text-slate-500">Details will be published soon.</p>;
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const Tag = `h${Math.min(b.level + 1, 4)}`;
          return <Tag key={i} className="mt-4 font-display text-navy">{b.text}</Tag>;
        }
        if (b.type === 'list') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-6 text-slate-700">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          );
        }
        return <p key={i} className="leading-relaxed text-slate-700">{b.text}</p>;
      })}
    </div>
  );
}

export default function DirectoratePage({ resolveKey }) {
  const params = useParams();
  const key = resolveKey ? resolveKey(params) : params.key;
  const data = directorates[key];
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { data: dynamicItems = [] } = useDirectorateMenu(key);
  const { data: dbContent } = useQuery(directorateContentQuery(key));
  const { data: slides = [] } = useSlides();

  if (!data && dynamicItems.length === 0) return <ContentPage resolveId={() => `dir-${key}`} />;

  const { title, director: staticDirector, notifications = [], quickLinks = [], tabs: staticTabs = [] } = data || {};
  const director = dbContent?.directorName || dbContent?.directorPhoto
    ? { name: dbContent.directorName, role: dbContent.directorDesignation || staticDirector?.role, photo: dbContent.directorPhoto }
    : staticDirector;
  const tabs = dynamicItems.length > 0 ? buildDynamicTabs(dynamicItems) : staticTabs;
  const flat = flattenLeaves(tabs);
  // Match by the menu item's stable menuKey (set via header nav's ?tab=...),
  // falling back to the first tab (Home) when no param or no match.
  const active = (tabParam && flat.find((t) => t.item?.menuKey === tabParam)) || flat[0];
  const isHome = !tabParam || tabParam === 'home';

  return (
    <>
      {isHome && <HeroSlider slides={slides} />}
      <PageShell title={isHome ? undefined : active?.label}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            {director && (
              <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
                {director.photo ? (
                  <img src={director.photo} alt={director.name || director.role} className="h-28 w-28 rounded-full object-cover" />
                ) : (
                  <Avatar name={director.name} role={director.role} />
                )}
                <p className="mt-4 font-display font-semibold text-navy">{director.name || director.role}</p>
                {director.name && <p className="text-sm text-slate-600">{director.role}</p>}
              </div>
            )}

            {quickLinks.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-2 font-display font-semibold text-navy">Quick Links</h4>
                <ul className="space-y-1">
                  {quickLinks.map((l, i) => (
                    <li key={i}><a href={l.to} className="text-sm text-slate-700 hover:text-navy hover:underline">{l.label}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div>
            {notifications.length > 0 && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <h4 className="font-display font-semibold text-navy">Recent Notifications</h4>
                  <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {notifications.map((n, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {n.text}
                        {n.isNew && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">NEW</span>}
                      </span>
                      <span className="whitespace-nowrap text-xs text-slate-400">{n.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {active && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                {active.dynamic ? <DynamicTabContent item={active.item} /> : <Blocks blocks={active.blocks} />}
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
}
