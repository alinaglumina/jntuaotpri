import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from './PageShell.jsx';
import SafeHtml from './SafeHtml.jsx';
import { pageContentQuery, administrationQuery } from '../api/queries.js';
import pages from '../content/pages.json';
import Sidebar from './Sidebar.jsx';
import { ASSESSMENT_SIDEBAR_GROUPS } from '../content/assessmentSidebar.js';
import NaacDocumentsTable from './NaacDocumentsTable.jsx';

// Maps a content page id to an Administration roleKey, when that page
// should show a photo pulled from the Administration collection.
const ROLE_KEY_BY_PAGE = {
  'vice-chancellor': 'vc',
  'chancellor': 'chancellor',
  'rector': 'rector',
  'registrar': 'registrar',
};

// Renders a static page from the content manifest. If an admin has published an
// editable PageContent override under the same key, that HTML wins.
export default function ContentPage({ pageId, resolveId, sidebar, naacTable }) {
  const params = useParams();
  const id = pageId || (resolveId ? resolveId(params) : null);
  const page = id && pages[id];
  const roleKey = id && ROLE_KEY_BY_PAGE[id];
  const { data: override } = useQuery({ ...pageContentQuery(id), enabled: !!id });
  const { data: admin } = useQuery({ ...administrationQuery(roleKey) });
  const [expanded, setExpanded] = useState(false);
  const collapsible = id === 'vice-chancellor';

  const photo = admin?.photo
    ? (admin.photo.startsWith('http') ? admin.photo : admin.photo)
    : null;

  const PhotoBlock = photo ? (
    <img
      src={photo}
      alt={admin?.name || page?.title || 'Photo'}
      className="float-left mr-6 mb-4 h-40 w-40 rounded-full object-cover shadow-md"
    />
  ) : null;

  const sidebarEl = sidebar ? <Sidebar variant="light" header={<h3 className="font-display text-lg font-bold">Assessment &amp; Accreditation</h3>} groups={ASSESSMENT_SIDEBAR_GROUPS} /> : null;
  const naacTableEl = naacTable && params.key ? <NaacDocumentsTable criteria={params.key} /> : null;

  if (override?.body) {
    return (
      <PageShell title={override.heading || page?.title || 'Page'} sidebar={sidebarEl}>
        {PhotoBlock}
        {naacTableEl && <div className="mb-6">{naacTableEl}</div>}
        <div className={`mx-auto max-w-3xl relative ${collapsible && !expanded ? 'max-h-64 overflow-hidden' : ''}`}>
          <SafeHtml html={override.body} />
          {collapsible && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        {collapsible && (
          <div className="mx-auto max-w-3xl mt-2 clear-both">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="font-medium text-navy underline underline-offset-2"
            >
              {expanded ? 'Show less' : 'Read more...'}
            </button>
          </div>
        )}
      </PageShell>
    );
  }
  if (!page) return <PageShell title="Page not found"><p className="text-slate-600">This page has no content yet.</p></PageShell>;
  return (
    <PageShell title={page.title} sidebar={sidebarEl}>
      {PhotoBlock}
      {naacTableEl && <div className="mb-6">{naacTableEl}</div>}
      <div className={`mx-auto max-w-3xl relative ${collapsible && !expanded ? 'max-h-64 overflow-hidden' : ''}`}>
        <article className="prose-jntua space-y-4">
          {page.blocks.map((b, i) => {
            if (b.type === 'heading') { const Tag = `h${Math.min(b.level + 1, 4)}`; return <Tag key={i} className="mt-6 font-display text-navy">{b.text}</Tag>; }
            if (b.type === 'list') return <ul key={i} className="list-disc space-y-1 pl-6 text-slate-700">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
            return <p key={i} className="leading-relaxed text-slate-700">{b.text}</p>;
          })}
          {page.blocks.length === 0 && <p className="text-slate-500">Content coming soon.</p>}
        </article>
        {collapsible && !expanded && page.blocks.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {collapsible && page.blocks.length > 0 && (
        <div className="mx-auto max-w-3xl mt-2 clear-both">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="font-medium text-navy underline underline-offset-2"
          >
            {expanded ? 'Show less' : 'Read more...'}
          </button>
        </div>
      )}
    </PageShell>
  );
}
