import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PrefetchLink from '../ui/PrefetchLink.jsx';
import { DIRECTORATES } from '../../content/nav.js';
import { useNavMenu } from '../../api/public.js';

// Builds a nested {label, to, children, wide} tree from the flat
// key/parentKey list stored in the database (everything except Directorates).
function buildTree(items) {
  const byKey = {};
  items.forEach((it) => { byKey[it.key] = { label: it.label, to: it.to || undefined, wide: it.wide, order: it.order || 0, children: [] }; });
  const roots = [];
  items.forEach((it) => {
    const node = byKey[it.key];
    if (it.parentKey && byKey[it.parentKey]) byKey[it.parentKey].children.push(node);
    else if (!it.parentKey) roots.push(node);
  });
  function cleanup(node) {
    node.children.sort((a, b) => a.order - b.order);
    node.children.forEach(cleanup);
    if (node.children.length === 0) delete node.children;
  }
  roots.sort((a, b) => a.order - b.order);
  roots.forEach(cleanup);
  return roots;
}

function DesktopChild({ c, pathname }) {
  // c can be a plain link { label, to } or a nested group { label, children: [...] }
  if (c.children) {
    return (
      <div className="group/sub relative">
        <button className="flex w-full items-center justify-between px-4 py-2 text-sm text-ink hover:bg-navy/5">
          {c.label} <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
        </button>
        <div className="invisible absolute left-full top-0 w-64 rounded-lg bg-surface py-2 opacity-0 shadow-lift transition group-hover/sub:visible group-hover/sub:opacity-100">
          {c.children.map((sc) => (
            <PrefetchLink key={sc.to} to={sc.to}
              className={`block px-4 py-2 text-sm hover:bg-navy/5 ${pathname === sc.to ? 'font-semibold text-crimson' : 'text-ink'}`}>
              {sc.label}
            </PrefetchLink>
          ))}
        </div>
      </div>
    );
  }
  return (
    <PrefetchLink to={c.to}
      className={`block px-4 py-2 text-sm hover:bg-navy/5 ${pathname === c.to ? 'font-semibold text-crimson' : 'text-ink'}`}>
      {c.label}
    </PrefetchLink>
  );
}

function MobileChild({ c, onNavigate }) {
  const [open, setOpen] = useState(false);
  if (c.children) {
    return (
      <div className="border-t border-white/5">
        <button className="flex w-full items-center justify-between px-6 py-2 text-sm font-medium text-white/90"
          onClick={() => setOpen((v) => !v)}>
          {c.label}
          <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} text-[9px]`} aria-hidden="true" />
        </button>
        {open && (
          <div className="bg-navy-900/40 pb-1">
            {c.children.map((sc) => (
              <Link key={sc.to} to={sc.to} onClick={onNavigate}
                className="block px-8 py-2 text-sm text-white/80 hover:text-gold">{sc.label}</Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <Link to={c.to} onClick={onNavigate} className="block px-6 py-2 text-sm text-white/90 hover:text-gold">
      {c.label}
    </Link>
  );
}

export default function MegaNav() {
  const [openMobile, setOpenMobile] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const { pathname } = useLocation();
  const { data: navItems = [] } = useNavMenu();

  const dynamicRoots = buildTree(navItems);
  const directoratesGroup = {
    label: 'Directorates', wide: true, order: 3,
    children: DIRECTORATES.map(([, label, slug]) => ({ label, to: `/directorates/${slug}` })),
  };
  const NAV = [...dynamicRoots, directoratesGroup].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <nav className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="container flex items-center justify-between">
        {/* Desktop */}
        <ul className="hidden items-stretch md:flex">
          {NAV.map((item) => (
            <li key={item.label} className="group relative">
              {item.children ? (
                <>
                  <button className="flex h-full items-center gap-1 px-4 py-3 text-sm font-semibold hover:bg-navy-700">
                    {item.label} <i className="fa-solid fa-chevron-down text-[10px]" aria-hidden="true" />
                  </button>
                  <div className={`invisible absolute left-0 top-full ${item.wide ? 'w-80' : 'w-64'} rounded-b-lg bg-surface py-2 text-ink opacity-0 shadow-lift transition group-hover:visible group-hover:opacity-100`}>
                    {item.children.map((c) => (
                      <DesktopChild key={c.to || c.label} c={c} pathname={pathname} />
                    ))}
                  </div>
                </>
              ) : (
                <PrefetchLink to={item.to} className={`flex h-full items-center gap-1 px-4 py-3 text-sm font-semibold hover:bg-navy-700 ${pathname === item.to ? 'bg-navy-700' : ''}`}>
                  <i className="fa-solid fa-house text-xs" aria-hidden="true" /> {item.label}
                </PrefetchLink>
              )}
            </li>
          ))}
        </ul>
        {/* Mobile toggle */}
        <button className="flex items-center gap-2 px-2 py-3 text-sm font-semibold md:hidden" onClick={() => setOpenMobile((v) => !v)}>
          <i className={`fa-solid ${openMobile ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" /> Menu
        </button>
        <Link to="/login" className="my-2 mr-1 rounded border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-surface hover:text-navy md:hidden">
          Admin
        </Link>
      </div>
      {/* Mobile drawer */}
      {openMobile && (
        <div className="border-t border-white/10 bg-navy-700 md:hidden">
          {NAV.map((item) => (
            <div key={item.label} className="border-b border-white/10">
              {item.children ? (
                <>
                  <button className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
                    onClick={() => setMobileGroup((g) => (g === item.label ? null : item.label))}>
                    {item.label}
                    <i className={`fa-solid fa-chevron-${mobileGroup === item.label ? 'up' : 'down'} text-[10px]`} aria-hidden="true" />
                  </button>
                  {mobileGroup === item.label && (
                    <div className="bg-navy-900/40 pb-2">
                      {item.children.map((c) => (
                        <MobileChild key={c.to || c.label} c={c} onNavigate={() => setOpenMobile(false)} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to={item.to} onClick={() => setOpenMobile(false)} className="block px-4 py-3 text-sm font-semibold">{item.label}</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
