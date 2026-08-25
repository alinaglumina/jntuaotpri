import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { useSearch } from '../api/search.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Card, SkeletonList, EmptyState, Badge, Highlight } from '../components/ui/index.js';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const debounced = useDebounce(q, 300);
  const { data, isFetching } = useSearch(debounced, { limit: 20 });
  const groups = data?.groups || [];

  const submit = (e) => { e.preventDefault(); setParams(q ? { q } : {}); };

  return (
    <PageShell title="Search" subtitle="Find pages, news, notices, faculty, departments, documents and results.">
      <form onSubmit={submit} className="mb-6 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search the university portal…"
          className="field flex-1" aria-label="Search query" />
        <button className="btn-primary" type="submit"><i className="fa-solid fa-magnifying-glass" /></button>
      </form>

      {debounced.length < 2 ? (
        <p className="text-sm text-muted">Type at least 2 characters.</p>
      ) : isFetching && !data ? (
        <SkeletonList items={6} />
      ) : (data?.total || 0) === 0 ? (
        <EmptyState label={`No results for “${debounced}”.`} icon="fa-magnifying-glass" />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">{data.total} result{data.total === 1 ? '' : 's'} for “{debounced}”</p>
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.type}>
                <h2 className="mb-2 flex items-center gap-2 text-lg"><i className={`fa-solid ${g.icon} text-crimson`} />{g.label} <Badge tone="slate">{g.count}</Badge></h2>
                <Card><div className="divide-y divide-line">
                  {g.items.map((it) => {
                    const inner = (
                      <>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-content"><Highlight text={it.title} term={debounced} /></span>
                          {it.subtitle && <span className="block truncate text-xs text-muted"><Highlight text={it.subtitle} term={debounced} /></span>}
                        </span>
                        <i className={`fa-solid ${it.external ? 'fa-arrow-up-right-from-square' : 'fa-chevron-right'} text-xs text-muted`} />
                      </>
                    );
                    return it.external
                      ? <a key={it.id} href={it.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-navy/5">{inner}</a>
                      : <Link key={it.id} to={it.link} className="flex items-center gap-3 px-4 py-3 hover:bg-navy/5">{inner}</Link>;
                  })}
                </div></Card>
              </section>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
