// Page control. page is 1-based. Renders a compact window around the current page.
export default function Pagination({ page, total, pageSize = 20, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const win = []; const from = Math.max(1, page - 2), to = Math.min(pages, page + 2);
  for (let i = from; i <= to; i++) win.push(i);
  const btn = 'grid h-8 min-w-8 place-items-center rounded px-2 text-sm';
  return (
    <nav className="mt-4 flex items-center justify-center gap-1" aria-label="Pagination">
      <button className={`${btn} border border-line disabled:opacity-40`} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous">‹</button>
      {from > 1 && <><button className={`${btn} hover:bg-navy/5`} onClick={() => onPage(1)}>1</button><span className="px-1 text-slate-400">…</span></>}
      {win.map((p) => <button key={p} className={`${btn} ${p === page ? 'bg-navy text-white' : 'hover:bg-navy/5'}`} onClick={() => onPage(p)}>{p}</button>)}
      {to < pages && <><span className="px-1 text-slate-400">…</span><button className={`${btn} hover:bg-navy/5`} onClick={() => onPage(pages)}>{pages}</button></>}
      <button className={`${btn} border border-line disabled:opacity-40`} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next">›</button>
    </nav>
  );
}
