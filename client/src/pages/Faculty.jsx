import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { SkeletonCard, ErrorState, EmptyState } from '../components/index.js';
import { useFaculty } from '../api/public.js';

// Buckets a free-text designation into one of the four standard ranks.
// Checked in this order so "Senior Professor" doesn't also count as "Professor".
function rankOf(designation) {
  const d = (designation || '').toLowerCase();
  if (d.includes('senior professor')) return 'senior';
  if (d.includes('associate professor')) return 'associate';
  if (d.includes('assistant professor')) return 'assistant';
  if (d.includes('professor')) return 'professor';
  return 'other';
}

const STAT_LABELS = [
  ['total', 'Total Faculty'],
  ['senior', 'Senior Professors'],
  ['professor', 'Professors'],
  ['associate', 'Associate Professors'],
  ['assistant', 'Assistant Professors'],
];

export default function Faculty() {
  const { data = [], isLoading, isError, error } = useFaculty();
  const [dept, setDept] = useState('all');

  const departments = useMemo(() => {
    const set = new Set(data.map((f) => f.department).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const counts = useMemo(() => {
    const c = { total: data.length, senior: 0, professor: 0, associate: 0, assistant: 0 };
    data.forEach((f) => {
      const r = rankOf(f.designation);
      if (r !== 'other') c[r] += 1;
    });
    return c;
  }, [data]);

  const filtered = useMemo(
    () => (dept === 'all' ? data : data.filter((f) => f.department === dept)),
    [data, dept]
  );

  return (
    <PageShell title="Faculty" subtitle="Meet the faculty members of JNTUA.">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : data.length === 0 ? (
        <EmptyState label="Faculty profiles will appear here once added." icon="fa-chalkboard-user" />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STAT_LABELS.map(([key, label]) => (
              <div key={key} className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-navy">{counts[key]}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Department filter */}
          {departments.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department:</label>
              <select
                id="dept-filter"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="rounded-md border border-line bg-white px-3 py-1.5 text-sm text-navy"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {dept !== 'all' && (
                <button onClick={() => setDept('all')} className="text-xs font-semibold text-crimson hover:underline">
                  Clear filter
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState label="No faculty found in this department." icon="fa-chalkboard-user" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((f) => (
                <div key={f._id} className="card overflow-hidden p-4 text-center">
                  {f.photo ? (
                    <img src={f.photo} alt={f.name} className="mx-auto h-28 w-28 rounded-full object-cover shadow-card" />
                  ) : (
                    <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-navy/5 text-navy">
                      <i className="fa-solid fa-user text-2xl" aria-hidden="true" />
                    </div>
                  )}
                  <p className="mt-3 font-display text-base font-bold text-navy">{f.name}</p>
                  {f.designation && <p className="text-sm text-slate-600">{f.designation}</p>}
                  {f.department && <p className="text-xs text-slate-500">{f.department}</p>}
                  {f.qualification && <p className="mt-1 text-xs text-slate-500">{f.qualification}</p>}
                  {f.email && (
                    <a href={`mailto:${f.email}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-crimson">
                      <i className="fa-solid fa-envelope" aria-hidden="true" /> {f.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
