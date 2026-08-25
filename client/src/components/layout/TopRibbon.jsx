import { Link } from 'react-router-dom';
import { RIBBON_LINKS, SOCIALS } from '../../content/nav.js';

export default function TopRibbon() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="border-b border-line bg-white text-navy">
      <div className="flex flex-wrap items-stretch justify-between gap-2 text-xs">
        <span className="flex items-center gap-2 bg-crimson px-4 py-1.5 font-semibold text-white"><i className="fa-solid fa-calendar-days" aria-hidden="true" />{today}</span>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3 px-4 py-1.5">
          {RIBBON_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-1 text-navy/80 hover:text-crimson">
              <i className={`fa-solid ${l.icon}`} aria-hidden="true" />{l.label}
            </Link>
          ))}
          <a href="https://jntuaebranchpayment.in/" target="_blank" rel="noopener noreferrer"
             className="rounded bg-crimson px-2 py-0.5 font-semibold text-white hover:bg-crimson-700">
            <i className="fa-solid fa-file-pen" aria-hidden="true" /> Apply Online OD
          </a>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(([icon, url]) => (
            <a key={icon} href={url} target="_blank" rel="noopener noreferrer" aria-label={icon}
               className="grid h-6 w-6 place-items-center rounded-full border border-navy/15 bg-navy/5 text-navy/70 hover:border-crimson hover:bg-crimson hover:text-white">
              <i className={`fab fa-${icon} text-[11px]`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
