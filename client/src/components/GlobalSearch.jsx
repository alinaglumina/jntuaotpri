import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSearch, usePopularSearches } from '../api/search.js';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import Highlight from './ui/Highlight.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

// Flattens grouped results into a single ordered list for arrow-key navigation.
function useFlat(groups) {
  return useMemo(() => {
    const flat = [];
    (groups || []).forEach((g) => g.items.forEach((it) => flat.push({ ...it, group: g.label, icon: g.icon, type: g.type })));
    return flat;
  }, [groups]);
}

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const debounced = useDebounce(q, 250);
  const { data, isFetching } = useSearch(debounced, { limit: 5, enabled: open });
  const { recent, add: addRecent, clear: clearRecent } = useRecentSearches();
  const { data: popular } = usePopularSearches(open);
  const groups = data?.groups || [];
  const flat = useFlat(groups);

  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 30); setQ(''); setActive(0); } }, [open]);
  useEffect(() => { setActive(0); }, [debounced]);

  const go = useCallback((item) => {
    if (!item) return;
    if (debounced.length >= 2) addRecent(debounced);
    onClose();
    if (item.external) window.open(item.link, '_blank', 'noopener');
    else navigate(item.link);
  }, [navigate, onClose, debounced, addRecent]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]) go(flat[active]);
      else if (debounced.length >= 2) { onClose(); navigate(`/search?q=${encodeURIComponent(debounced)}`); }
    } else if (e.key === 'Escape') onClose();
  };

  if (!open) return null;
  let idx = -1;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 pt-44 sm:pt-56" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-lift" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <i className={`fa-solid fa-magnifying-glass text-muted ${isFetching ? 'fa-fade' : ''}`} aria-hidden="true" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Search pages, news, faculty, results…" aria-label="Search query"
            className="flex-1 bg-transparent py-4 text-content outline-none border-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted" />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">ESC</kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {debounced.length < 2 ? (
            <div className="px-4 py-5">
              {recent.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Recent</p>
                    <button className="text-[11px] text-muted hover:text-crimson" onClick={clearRecent}>Clear</button></div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((t) => <button key={t} onClick={() => setQ(t)} className="rounded-full border border-line px-3 py-1 text-xs text-brand hover:bg-navy/5"><i className="fa-solid fa-clock-rotate-left mr-1 text-muted" />{t}</button>)}
                  </div>
                </div>
              )}
              {(popular?.terms || []).length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {popular.terms.map((t) => <button key={t} onClick={() => setQ(t)} className="rounded-full border border-line px-3 py-1 text-xs text-brand hover:bg-navy/5"><i className="fa-solid fa-fire mr-1 text-crimson" />{t}</button>)}
                  </div>
                </div>
              )}
              {recent.length === 0 && !(popular?.terms || []).length && <p className="py-4 text-center text-sm text-muted">Type at least 2 characters to search.</p>}
            </div>
          ) : flat.length === 0 && !isFetching ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No results for “{debounced}”.</p>
          ) : (
            groups.map((g) => (
              <div key={g.type} className="py-1">
                <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted"><i className={`fa-solid ${g.icon} mr-1.5`} />{g.label}</p>
                {g.items.map((it) => {
                  idx += 1; const isActive = idx === active; const myIdx = idx;
                  return (
                    <button key={`${g.type}-${it.id}`} onMouseEnter={() => setActive(myIdx)} onClick={() => go(it)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left ${isActive ? 'bg-navy/10' : 'hover:bg-navy/5'}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-content"><Highlight text={it.title} term={debounced} /></span>
                        {it.subtitle && <span className="block truncate text-xs text-muted"><Highlight text={it.subtitle} term={debounced} /></span>}
                      </span>
                      {it.external && <i className="fa-solid fa-arrow-up-right-from-square text-xs text-muted" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {data?.total > 0 && (
          <button onClick={() => { onClose(); navigate(`/search?q=${encodeURIComponent(debounced)}`); }}
            className="w-full border-t border-line bg-canvas px-4 py-2.5 text-center text-xs font-semibold text-brand hover:bg-navy/5">
            View all {data.total} results <i className="fa-solid fa-arrow-right ml-1" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
