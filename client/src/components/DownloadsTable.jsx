import { useQuery } from '@tanstack/react-query';
import { downloadsQuery } from '../api/queries.js';
// Renders a S.No / [Date] / Title / Attachment table for a Downloads section.
// Column labels and the Date column are configurable so this one component
// can serve Downloadable Documents, Programmes Organised, Fee Structure, etc.
export default function DownloadsTable({ section, showDate = true, titleLabel = 'Title', attachmentLabel = 'View/Download' }) {
  const { data, isLoading } = useQuery(downloadsQuery(section));
  const items = data?.items || [];
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            {showDate && <th className="px-4 py-3 w-32">Date</th>}
            <th className="px-4 py-3">{titleLabel}</th>
            <th className="px-4 py-3 w-28 text-center">{attachmentLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((doc, i) => (
            <tr key={doc._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
              {showDate && (
                <td className="px-4 py-3 text-slate-700">{doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
              )}
              <td className="px-4 py-3 text-slate-700">{doc.title}</td>
              <td className="px-4 py-3 text-center">
                {doc.attachment ? (
                  <a href={doc.attachment} target="_blank" rel="noopener noreferrer" aria-label={`Download ${doc.title}`}
                     className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                  </a>
                ) : <span className="text-slate-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
