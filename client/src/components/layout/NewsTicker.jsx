import { Link } from 'react-router-dom';
import { useNews } from '../../api/public.js';
const MAX_ITEMS = 15;
// Scrolling "LIVE NEWS" ticker — pulls from the News resource, sorted by
// most recent, into a continuously moving marquee.
export default function NewsTicker() {
  const { data: items = [] } = useNews();
  const merged = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_ITEMS);
  const loopItems = merged.length > 0 ? [...merged, ...merged] : [];
  return (
    <div className="overflow-hidden border-b border-gold/40 bg-gold/10">
      <div className="container flex items-center gap-3 py-1.5">
        <span className="flex shrink-0 items-center gap-1.5 rounded bg-crimson px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" /> Live News
        </span>
        <div className="relative flex-1 overflow-hidden">
          {merged.length === 0 ? (
            <span className="text-xs font-medium text-slate-500">No live updates at the moment.</span>
          ) : (
            <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
              {loopItems.map((n, i) => (
                n.attachment ? (
                  <a
                    key={`${n._id}-${i}`}
                    href={n.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-navy hover:text-crimson"
                  >
                    {n.title}
                  </a>
                ) : (
                  <span key={`${n._id}-${i}`} className="text-xs font-medium text-navy">
                    {n.title}
                  </span>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
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
