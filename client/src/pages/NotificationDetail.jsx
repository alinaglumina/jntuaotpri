import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Loading, ErrorState } from '../components/ui/index.js';
import api from '../lib/axios.js';

const TONE = { exam: 'crimson', admission: 'gold', tenders: 'slate', news: 'navy', 'live-news': 'crimson', research: 'navy', placement: 'green', sports: 'gold' };

// Single-notification page: title, category badges, date, and every
// attachment listed in a S.No / File / Download table.
export default function NotificationDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notifications', 'detail', id],
    queryFn: () => api.get(`/notifications/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <PageShell title="Notification"><Loading /></PageShell>;
  if (isError || !data) return <PageShell title="Notification"><ErrorState error={error || new Error('Not found')} /></PageShell>;

  const categories = Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []);
  const files = Array.isArray(data.attachments) ? data.attachments : [];
  const fileNames = Array.isArray(data.attachmentsNames) ? data.attachmentsNames : [];
  const date = data.publishedAt || data.createdAt;

  return (
    <PageShell title={data.title}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {categories.map((c) => <Badge key={c} tone={TONE[c] || 'navy'}>{c}</Badge>)}
          {date && <span className="text-sm text-slate-500">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </div>

        {files.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No files attached to this notification.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 w-16">S.No</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3 w-28 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {files.map((url, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                    <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                    <td className="px-4 py-3 text-slate-700">{fileNames[i] || `File ${i + 1}`}</td>
                    <td className="px-4 py-3 text-center">
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Download file ${i + 1}`}
                         className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                        <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
