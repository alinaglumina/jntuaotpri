import { useState } from 'react';
// Controlled or uncontrolled search input with an icon + optional debounce.
export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search…', className = '' }) {
  const [local, setLocal] = useState(value ?? '');
  const val = value ?? local;
  const set = (v) => { onChange ? onChange(v) : setLocal(v); };
  return (
    <div className={`relative ${className}`}>
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        value={val} onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.(val)}
        placeholder={placeholder} aria-label="Search"
        className="w-full rounded-full border border-line py-2 pl-9 pr-4 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-crimson/30"
      />
    </div>
  );
}
