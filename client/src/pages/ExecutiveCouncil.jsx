import PageShell from '../components/PageShell.jsx';
import { SkeletonCard, ErrorState, EmptyState } from '../components/index.js';
import { useExecutiveCouncil } from '../api/public.js';

export default function ExecutiveCouncil() {
  const { data = [], isLoading, isError, error } = useExecutiveCouncil();

  return (
    <PageShell title="Executive Council" subtitle="Members of the JNTUA Executive Council.">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : data.length === 0 ? (
        <EmptyState label="Executive Council members will appear here once added." icon="fa-users" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.map((m) => (
            <div key={m._id} className="card overflow-hidden p-4 text-center">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="mx-auto h-28 w-28 rounded-full object-cover shadow-card" />
              ) : (
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-navy/5 text-navy">
                  <i className="fa-solid fa-user text-2xl" aria-hidden="true" />
                </div>
              )}
              <p className="mt-3 font-display text-base font-bold text-navy">{m.name}</p>
              {m.designation && <p className="text-sm text-slate-600">{m.designation}</p>}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
