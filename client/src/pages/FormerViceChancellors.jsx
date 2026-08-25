import PageShell from '../components/PageShell.jsx';
import SafeHtml from '../components/SafeHtml.jsx';
import { SkeletonCard, ErrorState, EmptyState } from '../components/index.js';
import { useFormerVCs } from '../api/public.js';

export default function FormerViceChancellors() {
  const { data = [], isLoading, isError, error } = useFormerVCs();

  return (
    <PageShell title="Former Vice-Chancellors" subtitle="Past Vice-Chancellors of JNTUA.">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : data.length === 0 ? (
        <EmptyState label="Former Vice-Chancellors will appear here once added." icon="fa-user-tie" />
      ) : (
        <div className="space-y-8">
          {data.map((m) => (
            <div key={m._id} className="card flex flex-col gap-4 p-6 sm:flex-row">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="mx-auto h-32 w-32 shrink-0 rounded-full object-cover shadow-card sm:mx-0" />
              ) : (
                <div className="mx-auto grid h-32 w-32 shrink-0 place-items-center rounded-full bg-navy/5 text-navy sm:mx-0">
                  <i className="fa-solid fa-user-tie text-3xl" aria-hidden="true" />
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="font-display text-lg font-bold text-navy">{m.name}</p>
                {m.tenure && <p className="text-sm text-slate-500">{m.tenure}</p>}
                {m.profileText && <div className="mt-2 text-sm text-slate-700"><SafeHtml html={m.profileText} /></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
