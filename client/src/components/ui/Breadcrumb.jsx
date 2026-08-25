import { Link } from 'react-router-dom';
// items: [{ label, to? }]. Last item is rendered as current (no link).
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link to="/" className="hover:text-crimson"><i className="fa-solid fa-house" aria-hidden="true" /></Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            <i className="fa-solid fa-angle-right text-[10px] text-slate-300" aria-hidden="true" />
            {it.to && i < items.length - 1
              ? <Link to={it.to} className="hover:text-crimson">{it.label}</Link>
              : <span className="font-medium text-navy">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
