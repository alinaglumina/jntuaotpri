import { Link } from 'react-router-dom';
import SafeHtml from './SafeHtml.jsx';
import FacultyTable from './FacultyTable.jsx';

// Department landing/sub-page template — matches the reference design:
// a dark department sidebar (icon, name, sub-page nav) alongside either the
// "Welcome to X" hero overview (landing) or a sub-page's content.
export default function DepartmentPage({ departmentLabel, siblingPages, activeItem, isLanding }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
      <aside className="rounded-lg bg-navy-900 p-6 text-white">
        <i className="fa-solid fa-building-columns mb-3 block text-3xl text-white/70" aria-hidden="true" />
        <h3 className="font-display text-xl font-bold leading-tight">{departmentLabel}</h3>
        <div className="mt-2 mb-4 h-0.5 w-16 bg-crimson" />
        <nav className="space-y-1">
          {siblingPages.map((p) => {
            const active = p.item?.menuKey === activeItem?.menuKey;
            return (
              <Link
                key={p.item?.menuKey}
                to={`/?tab=${p.item?.menuKey}`}
                className={`flex items-center justify-between rounded px-3 py-2 text-sm transition ${active ? 'bg-white/10 font-semibold text-gold' : 'text-white/85 hover:bg-white/5 hover:text-gold'}`}
              >
                {p.label} <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </aside>

      <div>
        {isLanding ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span className="h-px w-10 bg-slate-300" /> Department Overview <span className="h-px w-10 bg-slate-300" />
            </div>
            <h2 className="font-display text-3xl text-slate-700 md:text-4xl">Welcome to</h2>
            <h1 className="mt-1 font-display text-4xl font-bold text-navy md:text-5xl">{departmentLabel}</h1>
            <div className="mx-auto mt-4 mb-6 h-1 w-24 rounded bg-crimson" />
            {activeItem?.body && (
              <p className="mx-auto max-w-2xl text-slate-600">{activeItem.body}</p>
            )}
          </div>
        ) : activeItem?.menuKey === 'pharmacy-teaching-staff' ? (
          <FacultyTable department="Pharmacy" />
        ) : activeItem?.menuKey === 'food-technology-teaching-staff' ? (
          <FacultyTable department="Food Technology" />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-display text-2xl text-navy">{activeItem?.label}</h2>
            {activeItem?.body ? <SafeHtml html={activeItem.body} /> : <p className="text-slate-500">Content coming soon.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
