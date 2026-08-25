// Spinner + the three async states, in one place.
export function Spinner({ size = 'text-2xl', className = '' }) {
  return <i className={`fa-solid fa-spinner fa-spin text-navy ${size} ${className}`} aria-hidden="true" />;
}
export function Loading({ label = 'Loading…' }) {
  return <div className="grid place-items-center py-16"><Spinner /><span className="mt-2 text-sm text-slate-500">{label}</span></div>;
}
export function ErrorState({ error }) {
  return <div className="rounded-md bg-crimson/5 p-6 text-center text-crimson-700"><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Couldn’t load this. {error?.message}</div>;
}
export function EmptyState({ label = 'Nothing here yet.', icon = 'fa-inbox' }) {
  return <div className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-500"><i className={`fa-solid ${icon} mb-2 block text-2xl text-slate-300`} aria-hidden="true" />{label}</div>;
}
