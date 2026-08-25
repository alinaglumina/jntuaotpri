import { useMatches } from 'react-router-dom';
import Breadcrumb from './ui/Breadcrumb.jsx';
import { SITE_URL } from './Seo.jsx';

// Derives breadcrumbs from the nested route structure: any matched route that
// declares handle.crumb contributes crumbs. Also emits BreadcrumbList JSON-LD
// so search engines can render breadcrumb rich results.
export default function Breadcrumbs({ root, bar = true }) {
  const matches = useMatches();
  const items = matches
    .filter((m) => m.handle?.crumb)
    .flatMap((m) => {
      const out = typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb;
      return (Array.isArray(out) ? out : [out]).filter(Boolean).map((c) => (typeof c === 'string' ? { label: c } : c));
    });
  const trail = root ? [root, ...items] : items;
  if (trail.length === 0) return null;

  // Full trail incl. Home for the schema (visual trail may omit Home).
  const schemaItems = [{ label: 'Home', to: '/' }, ...trail];
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: schemaItems.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.label,
      ...(c.to ? { item: `${SITE_URL}${c.to}` } : {}),
    })),
  };
  const jsonLd = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />;

  if (!bar) return <>{jsonLd}<Breadcrumb items={trail} /></>;
  return (
    <>
      {jsonLd}
      <div className="border-b border-line bg-surface">
        <div className="container py-2"><Breadcrumb items={trail} /></div>
      </div>
    </>
  );
}
