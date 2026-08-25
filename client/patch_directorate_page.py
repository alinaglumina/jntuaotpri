path = "src/components/DirectoratePage.jsx"
with open(path) as f:
    content = f.read()

changes = []

old1 = '''import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import ContentPage from './ContentPage.jsx';
import directorates from '../content/directorates.json';'''
new1 = '''import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import ContentPage from './ContentPage.jsx';
import SafeHtml from './SafeHtml.jsx';
import directorates from '../content/directorates.json';
import { useDirectorateMenu } from '../api/public.js';'''
changes.append(("imports", old1, new1))

old2 = '''function Blocks({ blocks }) {
  if (!blocks || blocks.length === 0) return <p className="text-slate-500">Details will be published soon.</p>;'''
new2 = '''function DynamicTabContent({ item }) {
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
  if (!blocks || blocks.length === 0) return <p className="text-slate-500">Details will be published soon.</p>;'''
changes.append(("DynamicTabContent renderer", old2, new2))

old3 = '''  if (!data) return <ContentPage resolveId={() => `dir-${key}`} />;

  const { title, director, notifications = [], quickLinks = [], tabs = [] } = data;
  const flat = flattenLeaves(tabs);
  const active = flat.find((t) => t.key === activeKey) || flat[0];'''
new3 = '''  const { data: dynamicItems = [] } = useDirectorateMenu(key);

  if (!data && dynamicItems.length === 0) return <ContentPage resolveId={() => `dir-${key}`} />;

  const { title, director, notifications = [], quickLinks = [], tabs: staticTabs = [] } = data || {};
  const tabs = [...staticTabs];
  dynamicItems.forEach((item) => {
    const idx = tabs.findIndex((t) => !t.children && t.label === item.label);
    const dynamicTab = { label: item.label, dynamic: true, item };
    if (idx >= 0) tabs[idx] = dynamicTab;
    else tabs.push(dynamicTab);
  });
  const flat = flattenLeaves(tabs);
  const active = flat.find((t) => t.key === activeKey) || flat[0];'''
changes.append(("merge dynamic + static tabs", old3, new3))

old4 = '''      if (n.children) out = out.concat(flattenLeaves(n.children, key));
      else out.push({ key, label: n.label, blocks: n.blocks });'''
new4 = '''      if (n.children) out = out.concat(flattenLeaves(n.children, key));
      else out.push({ key, label: n.label, blocks: n.blocks, dynamic: n.dynamic, item: n.item });'''
changes.append(("flattenLeaves carries dynamic fields", old4, new4))

old5 = '''                <div className="p-6">
                  <Blocks blocks={active.blocks} />
                </div>'''
new5 = '''                <div className="p-6">
                  {active.dynamic ? <DynamicTabContent item={active.item} /> : <Blocks blocks={active.blocks} />}
                </div>'''
changes.append(("conditional tab content render", old5, new5))

old6 = '''    <PageShell title={title}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
            {director.photo ? (
              <img src={director.photo} alt={director.name || director.role} className="h-28 w-28 rounded-full object-cover" />
            ) : (
              <Avatar name={director.name} role={director.role} />
            )}
            <p className="mt-4 font-display font-semibold text-navy">{director.name || director.role}</p>
            {director.name && <p className="text-sm text-slate-600">{director.role}</p>}
          </div>'''
new6 = '''    <PageShell title={title || key}>
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
          )}'''
changes.append(("optional director sidebar", old6, new6))

results = []
for name, old, new in changes:
    if old in content:
        content = content.replace(old, new, 1)
        results.append(f"OK: {name}")
    else:
        results.append(f"FAIL: {name}")

with open(path, "w") as f:
    f.write(content)

for r in results:
    print(r)
