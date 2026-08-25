import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useEMagazines } from '../api/public.js';

export default function EMagazines() {
  const { data = [], isLoading, isError, error } = useEMagazines();
  return (
    <PageShell title="E-Magazines" subtitle="University newsletters and magazine issues.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="Issues will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => (
            <a key={e._id} href={e.filename} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-4 hover:shadow-lift">
              <i className="fa-solid fa-book-open text-2xl text-crimson" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-navy">{e.monthYear}</span>
                <span className="block text-xs text-slate-500">Open PDF</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </PageShell>
  );
}
