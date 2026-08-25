import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios.js';

const SITE = 'JNTU Anantapur';
const SITE_FULL = 'Jawaharlal Nehru Technological University Anantapur';
const DEFAULT_DESC = 'Jawaharlal Nehru Technological University Anantapur — excellence in technical education, research and innovation.';
// Canonical origin — set VITE_SITE_URL at build time; falls back to the runtime origin.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://jntua.ac.in')).replace(/\/$/, '');
const LOGO = `${SITE_URL}/logo.png`;

// SEO: title/description/canonical + Open Graph + Twitter + JSON-LD structured
// data. `auto` merges admin-managed SeoMeta for the path. `site` adds the
// site-wide Organization + WebSite schema (render once, in the root layout).
// `schema` accepts extra JSON-LD object(s) for the specific page (e.g. Article).
export default function Seo({ title, description, image, canonical, noindex, type = 'website', auto = false, site = false, schema }) {
  const { pathname } = useLocation();
  const { data: meta } = useQuery({
    queryKey: ['seo', pathname],
    queryFn: () => api.get(`/seo/key${pathname}`).catch(() => null),
    enabled: auto, staleTime: 5 * 60 * 1000, retry: false,
  });

  const t = meta?.title || title;
  const fullTitle = t ? `${t} — ${SITE}` : SITE_FULL;
  const desc = meta?.description || description || DEFAULT_DESC;
  const url = canonical || meta?.canonical || `${SITE_URL}${pathname}`;
  const img = image || meta?.ogImage;
  const noIndex = noindex ?? meta?.noindex;

  // Site-wide structured data: EducationalOrganization + WebSite w/ search action.
  const siteSchema = site ? [
    { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: SITE_FULL, alternateName: 'JNTUA', url: SITE_URL, logo: LOGO,
      address: { '@type': 'PostalAddress', addressLocality: 'Ananthapuramu', addressRegion: 'Andhra Pradesh', postalCode: '515002', addressCountry: 'IN' } },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_FULL, url: SITE_URL,
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
  ] : [];
  const pageSchema = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const jsonLd = [...siteSchema, ...pageSchema];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {meta?.keywords && <meta name="keywords" content={meta.keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_FULL} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {img && <meta property="og:image" content={img} />}
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content={img ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {img && <meta name="twitter:image" content={img} />}
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );

}

// Helpers to build common page-level schemas.
export const articleSchema = ({ title, description, image, datePublished, url }) => ({
  '@context': 'https://schema.org', '@type': 'NewsArticle', headline: title, description,
  image: image ? [image] : undefined, datePublished, dateModified: datePublished,
  mainEntityOfPage: url, publisher: { '@type': 'Organization', name: SITE_FULL, logo: { '@type': 'ImageObject', url: LOGO } },
});
