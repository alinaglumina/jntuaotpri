import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDirectorateMenu } from '../../api/public.js';
import { buildDynamicTabs } from '../../utils/directorateTabs.js';

// Header dropdown navigation, built from the same OTPRI menu-tree data the
// homepage content area renders — so the two always stay in sync. Top-level
// items with children show a hover dropdown; leaves link via ?tab=<menuKey>.
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
          const isActive = isLeaf ? activeTab === menuKey : (t.children || []).some((c) => c.item?.menuKey === activeTab);

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
                <div className="absolute left-0 top-full z-20 min-w-[220px] rounded-b-lg bg-white py-1 shadow-lift">
                  {t.children.map((c) => (
                    <Link
                      key={c.item?.menuKey}
                      to={`/?tab=${c.item?.menuKey}`}
                      onClick={() => setOpenIndex(null)}
                      className={`block px-4 py-2 text-sm hover:bg-navy/5 ${activeTab === c.item?.menuKey ? 'font-semibold text-crimson' : 'text-ink'}`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
