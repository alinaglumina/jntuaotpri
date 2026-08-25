// Dashboard metric card.
export default function StatWidget({ icon, label, value, tone = 'navy', hint }) {
  const tones = { navy: 'bg-navy/5 text-navy', crimson: 'bg-crimson/10 text-crimson', gold: 'bg-gold/15 text-[#8a6d13]', green: 'bg-green-100 text-green-700' };
  return (
    <div className="flex items-center gap-4 rounded-lg bg-surface p-5 shadow-card">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><i className={`fa-solid ${icon} text-lg`} aria-hidden="true" /></span>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-xs text-muted">{label}</p>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
