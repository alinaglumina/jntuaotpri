import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios.js';
import { RESOURCES } from './resources.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Highlight } from '../components/ui/index.js';

// Admin command palette (Cmd/Ctrl+K in the admin). Two things at once:
//  1) instant section jump (filters the resource manifest client-side)
//  2) record search across CRUD resources (server /admin/search)
export default function AdminSearch({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const debounced = useDebounce(q, 250);

  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 30); setQ(''); setActive(0); } }, [open]);

  // Section matches (labels/groups) — instant, no network.
  const sections = useMemo(() => {
    const term = debounced.toLowerCase();
    return Object.entries(RESOURCES)
      .filter(([key, def]) => !term || def.label.toLowerCase().includes(term) || key.includes(term) || (def.group || '').toLowerCase().includes(term))
      .slice(0, 8)
      .map(([key, def]) => ({ kind: 'section', key, label: def.label, icon: def.icon, group: def.group, link: `/admin/r/${key}` }));
  }, [debounced]);

  // Record matches from the server.
  const { data } = useQuery({
    queryKey: ['admin-search', debounced],
    queryFn: () => api.get('/admin/search', { params: { q: debounced, limit: 4 } }),
    enabled: open && debounced.length >= 2, staleTime: 20_000, placeholderData: (p) => p,
  });
  const recordGroups = data?.groups || [];

  // Flatten for arrow-key nav: sections first, then records.
  const flat = useMemo(() => {
    const rows = sections.map((s) => ({ ...s }));
    recordGroups.forEach((g) => g.items.forEach((it) => rows.push({ kind: 'record', label: it.title, group: g.label, link: it.link })));
    return rows;
  }, [sections, recordGroups]);
  useEffect(() => { setActive(0); }, [debounced]);

  const go = useCallback((row) => { if (!row) return; onClose(); navigate(row.link); }, [navigate, onClose]);
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(flat[active]); }
    else if (e.key === 'Escape') onClose();
  };

  if (!open) return null;
  let idx = -1;
  const row = (item, label, sub, icon, ext) => {
    idx += 1; const isActive = idx === active; const myIdx = idx;
    return (
      <button key={label + idx} onMouseEnter={() => setActive(myIdx)} onClick={() => go(item)}
        className={`flex w-full items-center gap-3 px-4 py-2 text-left ${isActive ? 'bg-navy/10' : 'hover:bg-navy/5'}`}>
        {icon && <i className={`fa-solid ${icon} w-4 text-muted`} />}
        <span className="min-w-0 flex-1"><span className="block truncate text-sm text-content"><Highlight text={label} term={debounced} /></span>
          {sub && <span className="block truncate text-xs text-muted">{sub}</span>}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 p-4 pt-[10vh]" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-lift" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Admin search">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <i className="fa-solid fa-magnifying-glass text-muted" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Jump to a section or search records…" className="flex-1 bg-transparent py-4 text-content outline-none placeholder:text-muted" />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">ESC</kbd>
        </div>
        <div className="max-h-[55vh] overflow-y-auto">
          {sections.length > 0 && (
            <div className="py-1"><p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Sections</p>
              {sections.map((s) => row(s, s.label, s.group, s.icon))}</div>
          )}
          {recordGroups.map((g) => (
            <div key={g.type} className="py-1"><p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{g.label}</p>
              {g.items.map((it) => row({ link: it.link }, it.title))}</div>
          ))}
          {flat.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No matches.</p>}
        </div>
      </div>
    </div>
  );
}
