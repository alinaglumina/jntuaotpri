import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useHonoris } from '../api/public.js';

export default function Honoris() {
  const { data = [], isLoading, isError, error } = useHonoris();
  return (
    <PageShell title="Honoris Causa" subtitle="Honorary doctorates conferred by the university.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="Recipients will be listed here." />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-navy"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Degree</th><th className="px-4 py-3">Convocation</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((h) => (
                <tr key={h._id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3">{h.honorDegree}</td>
                  <td className="px-4 py-3">{h.convocationDate ? new Date(h.convocationDate).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
