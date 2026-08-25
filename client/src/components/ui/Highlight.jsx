// Highlights occurrences of `term` within `text` using <mark>. Case-insensitive,
// regex-escaped. Returns the plain string when there's no term/match.
export default function Highlight({ text = '', term = '' }) {
  const t = String(text);
  const q = term.trim();
  if (!q) return t;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = t.split(new RegExp(`(${esc})`, 'ig'));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="rounded bg-gold/40 px-0.5 text-inherit">{p}</mark>
      : p
  );
}
