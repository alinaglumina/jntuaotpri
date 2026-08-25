import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import ContentPage from './ContentPage.jsx';
import SafeHtml from './SafeHtml.jsx';
import directorates from '../content/directorates.json';
import { useDirectorateMenu } from '../api/public.js';
import { useQuery } from '@tanstack/react-query';
import { directorateContentQuery } from '../api/queries.js';

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

// Builds a nested {label, children, dynamic, item} tree from the flat
// menuKey/parentKey list of a directorate's admin-managed menu items.
function buildDynamicTabs(items) {
  const byKey = {};
  items.forEach((it) => { byKey[it.menuKey] = { label: it.label, dynamic: true, item: it, order: it.sortOrder || 0, children: [] }; });
  const roots = [];
  items.forEach((it) => {
    const node = byKey[it.menuKey];
    if (it.parentKey && byKey[it.parentKey]) byKey[it.parentKey].children.push(node);
    else if (!it.parentKey) roots.push(node);
  });
  function cleanup(node) {
    node.children.sort((a, b) => a.order - b.order);
    node.children.forEach(cleanup);
    if (node.children.length === 0) delete node.children;
  }
  roots.sort((a, b) => a.order - b.order);
  roots.forEach(cleanup);
  return roots;
}

function DynamicTabContent({ item }) {
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

// Recursively walks a node tree, assigning each leaf a stable path key like "1.0.2"
// so we can select it regardless of nesting depth.
function flattenLeaves(nodes, prefix = '') {
  let out = [];
  nodes.forEach((n, i) => {
    const key = prefix ? `${prefix}.${i}` : `${i}`;
    if (n.children) out = out.concat(flattenLeaves(n.children, key));
    else out.push({ key, label: n.label, blocks: n.blocks, dynamic: n.dynamic, item: n.item });
  });
  return out;
}

// Recursive flyout submenu — each level tracks its own "open" child via state,
// so only one branch is ever visible at a time (no CSS group-name collisions).
function FlyoutMenu({ nodes, prefix, activeKey, onSelect }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="min-w-[200px] rounded-lg bg-white py-1 shadow-lift" onMouseLeave={() => setOpenIndex(null)}>
      {nodes.map((n, i) => {
        const key = prefix ? `${prefix}.${i}` : `${i}`;
        const isActiveBranch = activeKey === key || activeKey.startsWith(`${key}.`);
        if (n.children) {
          return (
            <div key={n.label} className="relative" onMouseEnter={() => setOpenIndex(i)}>
              <button
                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-navy/5 ${
                  isActiveBranch ? 'font-semibold text-crimson' : 'text-ink'
                }`}
              >
                {n.label} <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
              </button>
              {openIndex === i && (
                <div className="absolute left-full top-0 z-10">
                  <FlyoutMenu nodes={n.children} prefix={key} activeKey={activeKey} onSelect={onSelect} />
                </div>
              )}
            </div>
          );
        }
        return (
          <button
            key={n.label}
            onMouseEnter={() => setOpenIndex(i)}
            onClick={() => onSelect(key)}
            className={`block w-full px-4 py-2 text-left text-sm hover:bg-navy/5 ${
              activeKey === key ? 'font-semibold text-crimson' : 'text-ink'
            }`}
          >
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

function TabBar({ tabs, activeKey, onSelect }) {
  const [openTab, setOpenTab] = useState(null);
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3" onMouseLeave={() => setOpenTab(null)}>
      {tabs.map((t, i) => {
        const topKey = `${i}`;
        if (t.children) {
          const isActiveGroup = activeKey === topKey || activeKey.startsWith(`${topKey}.`);
          return (
            <div key={t.label} className="relative" onMouseEnter={() => setOpenTab(i)}>
              <button
                className={`flex items-center gap-1 rounded-t-md px-4 py-2 text-sm font-medium transition ${
                  isActiveGroup ? 'border-b-2 border-navy text-navy' : 'text-slate-500 hover:text-navy'
                }`}
              >
                {t.label} <i className="fa-solid fa-chevron-down text-[9px]" aria-hidden="true" />
              </button>
              {openTab === i && (
                <div className="absolute left-0 top-full z-10">
                  <FlyoutMenu nodes={t.children} prefix={topKey} activeKey={activeKey} onSelect={onSelect} />
                </div>
              )}
            </div>
          );
        }
        return (
          <button
            key={t.label}
            onClick={() => onSelect(topKey)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
              activeKey === topKey ? 'border-b-2 border-navy text-navy' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function DirectoratePage({ resolveKey }) {
  const params = useParams();
  const key = resolveKey ? resolveKey(params) : params.key;
  const data = directorates[key];
  const [activeKey, setActiveKey] = useState('0');

  const { data: dynamicItems = [] } = useDirectorateMenu(key);
  const { data: dbContent } = useQuery(directorateContentQuery(key));

  if (!data && dynamicItems.length === 0) return <ContentPage resolveId={() => `dir-${key}`} />;

  const { title, director: staticDirector, notifications = [], quickLinks = [], tabs: staticTabs = [] } = data || {};
  // A database-managed director profile (admin's Directorate Pages screen) always
  // wins over the static JSON fallback, matching ContentPage's override pattern.
  const director = dbContent?.directorName || dbContent?.directorPhoto
    ? { name: dbContent.directorName, role: dbContent.directorDesignation || staticDirector?.role, photo: dbContent.directorPhoto }
    : staticDirector;
  // Prefer the admin-managed (database) menu items — they're the migrated,
  // editable source of truth. Fall back to the static tabs only if this
  // directorate has no database items yet.
  const tabs = dynamicItems.length > 0 ? buildDynamicTabs(dynamicItems) : staticTabs;
  const flat = flattenLeaves(tabs);
  const active = flat.find((t) => t.key === activeKey) || flat[0];

  return (
    <PageShell title={title || key}>
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

          {tabs.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <TabBar tabs={tabs} activeKey={active.key} onSelect={setActiveKey} />
              <div className="p-6">
                {active.dynamic ? <DynamicTabContent item={active.item} /> : <Blocks blocks={active.blocks} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
