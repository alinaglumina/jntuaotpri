import { useNews } from '../../api/public.js';
const MAX_ITEMS = 15;
const NEW_DAYS = 7; // items uploaded within this many days get a NEW badge
// Scrolling "LIVE NEWS" ticker — pulls from the News resource, sorted by
// most recent, into a continuously moving marquee. Each headline is numbered
// and recent uploads carry a NEW badge.
export default function NewsTicker() {
  const { data: items = [] } = useNews();
  const merged = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_ITEMS);
  const loopItems = merged.length > 0 ? [...merged, ...merged] : [];
  const isNew = (n) => n.createdAt && Date.now() - new Date(n.createdAt).getTime() < NEW_DAYS * 86400000;
  return (
    <div className="overflow-hidden border-b border-gold/40 bg-gold/10">
      <div className="container flex items-center gap-3 py-2.5">
        <span className="flex shrink-0 items-center gap-1.5 rounded bg-crimson px-2.5 py-1 text-sm font-bold uppercase tracking-wide text-white">
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" /> Live News
        </span>
        <div className="relative flex-1 overflow-hidden">
          {merged.length === 0 ? (
            <span className="text-base font-medium text-slate-500">No live updates at the moment.</span>
          ) : (
            <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
              {loopItems.map((n, i) => {
                const no = (i % merged.length) + 1;
                const inner = (
                  <>
                    <span className="mr-1.5 font-bold text-navy">{no}.</span>
                    {n.title}
                    {isNew(n) && (
                      <span className="ml-2 animate-pulse rounded bg-crimson px-1.5 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-white">New</span>
                    )}
                  </>
                );
                const cls = 'text-base font-semibold text-navy md:text-lg';
                return n.attachment ? (
                  <a key={`${n._id}-${i}`} href={n.attachment} target="_blank" rel="noopener noreferrer" className={`${cls} hover:text-crimson`}>{inner}</a>
                ) : (
                  <span key={`${n._id}-${i}`} className={cls}>{inner}</span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll 55s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
