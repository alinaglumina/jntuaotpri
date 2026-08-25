import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { useGlobalSearch } from '../../hooks/useGlobalSearch.js';

export default function Header() {
  const { openSearch } = useGlobalSearch();
  return (
    <header className="border-b border-line bg-surface">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <img src="/logos/jntua-logo.webp" alt="JNTUA Logo" className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16" />
          <span className="min-w-0 leading-tight">
            <h1 className="font-display text-base font-bold text-brand sm:text-lg md:text-2xl">Oil Technological &amp; Pharmaceutical Research Institute</h1>
            <span className="block text-xs text-muted sm:text-sm">A Constituent Institute of JNTU Anantapur</span>
            <span className="block text-[11px] text-muted sm:text-xs"><i className="fa-solid fa-location-dot text-gold" aria-hidden="true" /> Ananthapuramu – 515002, Andhra Pradesh, India</span>
          </span>
        </Link>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={openSearch} aria-label="Search (press / or Ctrl+K)" title="Search  (Ctrl/⌘+K)"
            className="flex items-center gap-2 rounded-full bg-navy/5 px-3.5 py-2 text-sm font-medium text-navy shadow-sm transition hover:bg-navy/10 hover:shadow">
            <i className="fa-solid fa-magnifying-glass text-xs" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-muted shadow-sm lg:inline">⌘K</kbd>
          </button>
          <ThemeToggle className="text-brand" />
          <img src="/logos/azadi-ka-amrit-mahotsav.png" alt="Azadi Ka Amrit Mahotsav" className="h-8 w-auto shrink-0 object-contain sm:h-12" />
          <img src="/logos/naac-badge.png" alt="NAAC Accredited" className="h-8 w-auto shrink-0 object-contain sm:h-12" />
          <img src="/logos/75-years-badge.png" alt="75 Years" className="h-8 w-auto shrink-0 object-contain sm:h-12" />
        </div>
      </div>
    </header>
  );
}
