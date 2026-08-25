// Loading-skeleton primitives. Prefer these over spinners for content-shaped
// placeholders (reduces layout shift + feels faster).
export function Skeleton({ className = '' }) { return <div className={`skeleton ${className}`} aria-hidden="true" />; }
export function SkeletonText({ lines = 3, className = '' }) {
  return <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => <div key={i} className={`skeleton h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />)}
  </div>;
}
export function SkeletonCard() {
  return <div className="rounded-lg bg-surface p-5 shadow-card" aria-hidden="true">
    <div className="skeleton mb-3 h-40 w-full rounded" /><div className="skeleton mb-2 h-4 w-3/4" /><SkeletonText lines={2} />
  </div>;
}
export function SkeletonTable({ rows = 6, cols = 4 }) {
  return <div className="overflow-hidden rounded-lg bg-surface shadow-card" role="status" aria-label="Loading">
    <div className="flex gap-4 border-b border-line px-4 py-3">{Array.from({ length: cols }).map((_, i) => <div key={i} className="skeleton h-4 flex-1" />)}</div>
    {Array.from({ length: rows }).map((_, r) => <div key={r} className="flex gap-4 border-b border-line px-4 py-3">{Array.from({ length: cols }).map((_, c) => <div key={c} className="skeleton h-3 flex-1" />)}</div>)}
    <span className="sr-only">Loading…</span>
  </div>;
}
export function SkeletonList({ items = 5 }) {
  return <div className="divide-y divide-line rounded-lg bg-surface shadow-card" role="status" aria-label="Loading">
    {Array.from({ length: items }).map((_, i) => <div key={i} className="flex items-center justify-between px-5 py-3"><div className="skeleton h-3 w-2/3" /><div className="skeleton h-3 w-12" /></div>)}
  </div>;
}
