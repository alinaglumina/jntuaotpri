import { useQuery } from '@tanstack/react-query';
import { downloadsQuery } from '../api/queries.js';

// Renders a S.No / Title / Attachment table for a Downloads section,
// matching the same layout style as NaacDocumentsTable.
export default function DownloadsTable({ section }) {
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
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 w-28 text-center">Attachment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((doc, i) => (
            <tr key={doc._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
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
