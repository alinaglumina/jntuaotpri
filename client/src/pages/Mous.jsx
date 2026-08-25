import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useMous } from '../api/public.js';

export default function Mous() {
  const { data = [], isLoading, isError, error } = useMous();
  return (
    <PageShell title="Tie-Ups & MOUs" subtitle="National and international collaborations.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="MOUs will be listed here." />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-navy">
              <tr><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Document</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((m) => (
                <tr key={m._id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 font-medium">{m.orgName}</td>
                  <td className="px-4 py-3">{m.mouType}</td>
                  <td className="px-4 py-3">{m.mouDate ? new Date(m.mouDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">{m.document ? <a href={m.document} target="_blank" rel="noopener noreferrer" className="text-crimson">View</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
