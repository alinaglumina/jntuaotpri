import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GlobalSearch from '../GlobalSearch.jsx';
import { SearchContext } from '../../hooks/useGlobalSearch.js';
import Header from './Header.jsx';
import OtpriMegaNav from './OtpriMegaNav.jsx';
import NewsTicker from './NewsTicker.jsx';
import Footer from './Footer.jsx';
import Breadcrumbs from '../Breadcrumbs.jsx';
import NavProgress from '../NavProgress.jsx';
import Seo from '../Seo.jsx';
export default function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <SearchContext.Provider value={{ openSearch: () => setSearchOpen(true) }}>
    <div className="flex min-h-screen flex-col bg-canvas text-content">
      <Seo auto site />
      <a href="#main" className="skip-link">Skip to main content</a>
      <NavProgress />
      <Header />
      <OtpriMegaNav />
      <NewsTicker />
      <Breadcrumbs />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none"><Outlet /></main>
      <Footer />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
    </SearchContext.Provider>
  );
}
