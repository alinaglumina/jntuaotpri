import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDirectorateMenu } from '../../api/public.js';
import { buildDynamicTabs } from '../../utils/directorateTabs.js';

// Checks whether any descendant leaf of a node matches the active tab —
// used to highlight a whole branch (e.g. "Academics") when a deeply nested
// child (e.g. Academics > Faculty > Pharmacy) is the active page.
function containsActive(node, activeTab) {
  if (!node.children) return node.item?.menuKey === activeTab;
  return node.children.some((c) => containsActive(c, activeTab));
}

// Recursive flyout submenu — any depth of nesting (e.g. Academics > Faculty >
// Pharmacy). Each level tracks its own open child so only one branch shows.
function FlyoutMenu({ nodes, activeTab }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="min-w-[220px] rounded-lg bg-white py-1 shadow-lift" onMouseLeave={() => setOpenIndex(null)}>
      {nodes.map((n, i) => {
        const isActiveBranch = containsActive(n, activeTab);
        if (n.children) {
          return (
            <div key={n.label} className="relative" onMouseEnter={() => setOpenIndex(i)}>
              <button type="button" className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-navy/5 ${isActiveBranch ? 'font-semibold text-crimson' : 'text-ink'}`}>
                {n.label} <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
              </button>
              {openIndex === i && (
                <div className="absolute left-full top-0 z-10">
                  <FlyoutMenu nodes={n.children} activeTab={activeTab} />
                </div>
              )}
            </div>
          );
        }
        return (
          <Link
            key={n.item?.menuKey}
            to={`/?tab=${n.item?.menuKey}`}
            className={`block px-4 py-2 text-sm hover:bg-navy/5 ${activeTab === n.item?.menuKey ? 'font-semibold text-crimson' : 'text-ink'}`}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}

// Header dropdown navigation, built from the same OTPRI menu-tree data the
// homepage content area renders — so the two always stay in sync.
export default function OtpriMegaNav() {
  const { data: items = [] } = useDirectorateMenu('otpri');
  const tabs = buildDynamicTabs(items);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const [openIndex, setOpenIndex] = useState(null);

  if (tabs.length === 0) return null;

  return (
    <nav className="border-b border-line bg-navy" onMouseLeave={() => setOpenIndex(null)}>
      <div className="container flex flex-wrap items-stretch">
        {tabs.map((t, i) => {
          const isLeaf = !t.children;
          const menuKey = t.item?.menuKey;
          const isActive = isLeaf ? activeTab === menuKey : containsActive(t, activeTab);

          if (isLeaf) {
            return (
              <Link
                key={menuKey}
                to={menuKey === 'home' ? '/' : `/?tab=${menuKey}`}
                className={`flex items-center px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-white/10 text-gold' : 'text-white/90 hover:bg-white/5 hover:text-gold'}`}
              >
                {t.label}
              </Link>
            );
          }

          return (
            <div key={t.label} className="relative" onMouseEnter={() => setOpenIndex(i)}>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-white/10 text-gold' : 'text-white/90 hover:bg-white/5 hover:text-gold'}`}
              >
                {t.label} <i className="fa-solid fa-chevron-down text-[9px]" aria-hidden="true" />
              </button>
              {openIndex === i && (
                <div className="absolute left-0 top-full z-20">
                  <FlyoutMenu nodes={t.children} activeTab={activeTab} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
