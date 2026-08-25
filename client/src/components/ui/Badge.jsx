// Small status/category label.
const TONES = {
  navy: 'bg-navy/10 text-navy', crimson: 'bg-crimson/10 text-crimson-700',
  gold: 'bg-gold/15 text-[#8a6d13]', green: 'bg-green-100 text-green-700',
  slate: 'bg-slate-100 text-slate-600',
};
export default function Badge({ tone = 'navy', className = '', children }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>{children}</span>;
}
