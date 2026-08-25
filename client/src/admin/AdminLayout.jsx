import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { RESOURCES, GROUPS } from './resources.js';
import { DIRECTORATES, UNITS } from '../content/nav.js';
import { ASSESSMENT_ADMIN_GROUPS, ACADEMICS_ADMIN_GROUPS } from './assessmentContentMenu.js';
import { useQuery } from '@tanstack/react-query';
import { adminPageQuery } from '../api/queries.js';
import { useAuth } from '../hooks/useAuth.js';
import { useLogout } from '../api/auth.js';
import { Sidebar, Breadcrumbs, NavProgress } from '../components/index.js';
import { ThemeToggle } from '../components/ui/index.js';
import AdminSearch from './AdminSearch.jsx';
import { Button } from '../components/ui/index.js';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  const mustChange = user?.must_change_pwd && !location.pathname.includes('/account/password');
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const visible = Object.entries(RESOURCES).filter(([, def]) => def.roles.includes(user?.role));

  // Resources whose form includes a 'directorateKey' field are directorate-scoped.
  const scopedEntries = visible.filter(([, d]) => d.fields?.some((f) => f.name === 'directorateKey'));
  const scopedKeys = new Set(scopedEntries.map(([key]) => key));
  const [expandedDirs, setExpandedDirs] = useState({});
  const toggleDir = (slug) => setExpandedDirs((p) => ({ ...p, [slug]: !p[slug] }));

  // Fetch ALL directorate menu items in one go (admin sees every directorate
  // unfiltered), then group them client-side — avoids 13 separate requests.
  const { data: menuData } = useQuery({ ...adminPageQuery('directorate-menu', { limit: 500 }), enabled: isAdmin || user?.role === 'director' });
  // Build a nested tree (parentKey) per directorate, then flatten it with
  // depth info for the sidebar's flat item list (indented + folder icon for groups).
  function buildMenuTree(items) {
    const byKey = {};
    items.forEach((it) => { byKey[it.menuKey] = { ...it, children: [] }; });
    const roots = [];
    items.forEach((it) => {
      const node = byKey[it.menuKey];
      if (it.parentKey && byKey[it.parentKey]) byKey[it.parentKey].children.push(node);
      else if (!it.parentKey) roots.push(node);
    });
    const sortRec = (list) => { list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); list.forEach((n) => sortRec(n.children)); };
    sortRec(roots);
    return roots;
  }
  function flattenForSidebar(nodes, depth = 0) {
    let out = [];
    nodes.forEach((n) => {
      out.push({ ...n, depth });
      if (n.children.length) out = out.concat(flattenForSidebar(n.children, depth + 1));
    });
    return out;
  }
  const menuByDirectorate = {};
  (menuData?.items || []).forEach((item) => {
    (menuByDirectorate[item.directorateKey] ||= []).push(item);
  });
  Object.keys(menuByDirectorate).forEach((slug) => {
    menuByDirectorate[slug] = flattenForSidebar(buildMenuTree(menuByDirectorate[slug]));
  });

  const TYPE_ICON = { page: 'fa-file-lines', resource: 'fa-link', link: 'fa-arrow-up-right-from-square' };
  const menuItemHref = (item, slug) => {
    if (item.type === 'resource' && item.linkResource) return `/admin/r/${item.linkResource}?directorate=${slug}`;
    if (item.type === 'link' && item.externalUrl) return item.externalUrl;
    return `/admin/r/directorate-menu?directorate=${slug}&edit=${item._id}`;
  };

  // Build the Sidebar groups from the resource manifest.
  const groups = GROUPS.map((g) => {
    const items = visible
      .filter(([key, d]) => d.group === g.id && !(isAdmin && scopedKeys.has(key) && !['faculty', 'notifications', 'news', 'directorate-content', 'events'].includes(key)) && !(!isAdmin && g.id === 'content' && !['notifications', 'news'].includes(key)) && !(!isAdmin && ['institutional', 'academics'].includes(g.id)) && !(!isAdmin && g.id === 'collaboration' && user?.directorate !== 'academic'))
      .map(([key, d]) => ({ to: `/admin/r/${key}`, label: d.label, icon: d.icon, onClick: close }));
    if (g.id === 'system' && isAdmin) {
      items.push({ to: '/admin/media', label: 'Media Library', icon: 'fa-photo-film', onClick: close });
      items.push({ to: '/admin/page-builder', label: 'Page Builder', icon: 'fa-cubes', onClick: close });
      items.push({ to: '/admin/menus-manager', label: 'Menu Management', icon: 'fa-bars', onClick: close });
    }
    return { label: g.label, items };
  }).filter((g) => g.items.length);

  // Director: show their own directorate's menu-tree (Home, About, etc.) —
  // always expanded, no collapsible toggle since they only have one directorate.
  if (!isAdmin && user?.role === 'director' && user?.directorate) {
    const dirItems = menuByDirectorate[user.directorate] || [];
    if (dirItems.length) {
      groups.unshift({
        label: 'My Directorate Pages',
        items: [
          ...dirItems.map((item) => ({
            to: menuItemHref(item, user.directorate),
            label: `${'\u2003'.repeat(item.depth)}${item.label}`,
            icon: item.children.length ? 'fa-folder' : (TYPE_ICON[item.type] || 'fa-file'),
            onClick: close,
          })),
        ],
      });
    }
  }

  // Super Admin: one collapsible section per Directorate, listing that
  // directorate's scoped resources when expanded. Directors don't see this —
  // their own sidebar already only shows their directorate's data (server-scoped).
  if (isAdmin) {
    // Shared builder — used for both Directorates and Important Units, since
    // both are backed by the same directorate-page + directorate-menu system.
    const buildCollapsibleGroup = (label, slug, iconClass) => {
      const isOpen = !!expandedDirs[slug];
      return {
        label: (
          <button type="button" onClick={() => toggleDir(slug)} className="flex w-full items-center justify-between text-left hover:text-white">
            <span><i className={`fa-solid ${iconClass} mr-1.5 text-[10px]`} aria-hidden="true" />{label}</span>
            <i className={`fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-right'} text-[9px]`} aria-hidden="true" />
          </button>
        ),
        items: !isOpen ? [] : [
          // Migrated public-page structure (Home, About, Courses Offered, etc.)
          ...(menuByDirectorate[slug]?.length
            ? [
                ...menuByDirectorate[slug].map((item) => ({
                  to: menuItemHref(item, slug),
                  label: `${'\u2003'.repeat(item.depth)}${item.label}`,
                  icon: item.children.length ? 'fa-folder' : (TYPE_ICON[item.type] || 'fa-file'),
                  onClick: close,
                })),
                { to: `/admin/r/directorate-menu?directorate=${slug}`, label: 'Manage menu items', icon: 'fa-sliders', onClick: close },
              ]
            : []),
          // Underlying raw content resources (Notifications, Circulars, etc.) —
          // always shown too, matching what a Director sees for their own directorate.
          // "News" is excluded here since it now lives only under the Content group.
          ...scopedEntries.filter(([key]) => key !== 'news').map(([key, d]) => ({
            to: `/admin/r/${key}?directorate=${slug}`, label: d.label, icon: d.icon, onClick: close,
          })),
        ],
      };
    };
    const directorateGroups = DIRECTORATES.map(([, dirLabel, slug]) => buildCollapsibleGroup(dirLabel, slug, 'fa-building-columns'));
    const unitGroups = UNITS.map(([, unitLabel, slug]) => buildCollapsibleGroup(unitLabel, slug, 'fa-flag'));
    groups.push(...directorateGroups, ...unitGroups);
  }

  // Curated CMS/admin groups (custom screens beyond the resource manifest).
  if (isAdmin) {
    groups.push(...ASSESSMENT_ADMIN_GROUPS.map((g) => ({
      label: g.label,
      items: g.items.map((it) => ({
        to: `/admin/r/page-content?editKey=${it.id}&heading=${encodeURIComponent(it.label)}`,
        label: it.label, icon: 'fa-file-pen', onClick: close,
      })),
    })));
    groups.push(...ACADEMICS_ADMIN_GROUPS.map((g) => ({
      label: g.label,
      items: g.items.map((it) => ({
        to: `/admin/r/page-content?editKey=${it.id}&heading=${encodeURIComponent(it.label)}`,
        label: it.label, icon: 'fa-file-pen', onClick: close,
      })),
    })));
    groups.push({ label: 'Communication', items: [
      { to: '/admin/messages', label: 'Contact Messages', icon: 'fa-inbox', onClick: close },
      { to: '/admin/enquiries', label: 'Enquiries', icon: 'fa-comments', onClick: close },
    ] });
    groups.push({ label: 'Administration', items: [
      { to: '/admin/roles', label: 'Roles & Permissions', icon: 'fa-user-shield', onClick: close },
      { to: '/admin/users', label: 'Users', icon: 'fa-users-gear', onClick: close },
      { to: '/admin/settings', label: 'Website Settings', icon: 'fa-gear', onClick: close },
      { to: '/admin/logs', label: 'Audit Logs', icon: 'fa-clipboard-list', onClick: close },
      { to: '/admin/backup', label: 'Backup', icon: 'fa-database', onClick: close },
    ] });
  }
  groups.push({ label: 'Account', items: [
    { to: '/admin/profile', label: 'My Profile', icon: 'fa-id-badge', onClick: close },
    { to: '/admin/login-history', label: 'Login History', icon: 'fa-clock-rotate-left', onClick: close },
    { to: '/admin/account/password', label: 'Change Password', icon: 'fa-key', onClick: close },
  ] });

  const signOut = async () => { await logout.mutateAsync(); navigate('/login', { replace: true }); };

  const nav = (
    <Sidebar
      header={<Link to="/admin"><span className="block font-display text-lg font-bold text-white">JNTUA Admin</span><span className="text-xs text-white/60">{isAdmin ? 'Super Admin' : (user?.directorate || 'Director')}</span></Link>}
      groups={groups}
      footer={<>
        <Link to="/admin/account/password" className="mb-2 block text-xs text-white/60 hover:text-gold"><i className="fa-solid fa-key" /> Change password</Link>
        <Link to="/" className="mb-2 block text-xs text-white/60 hover:text-gold"><i className="fa-solid fa-arrow-left" /> View site</Link>
        <Button variant="danger" size="sm" className="w-full" onClick={signOut}>Sign out</Button>
      </>}
    />
  );

  return (
    <div className="min-h-screen bg-canvas text-content"><NavProgress />
      <title>Admin — JNTUA</title>
      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">{nav}</aside>
      {open && <><aside className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">{nav}</aside><div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} /></>}
      <div className="md:pl-64">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu"><i className="fa-solid fa-bars text-navy" /></button>
          <span className="font-display font-bold text-navy">JNTUA Admin</span>
        </header>
        <div className="flex items-center justify-end gap-3 border-b border-line bg-surface px-6 py-2">
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-navy hover:text-brand">
            <i className="fa-solid fa-magnifying-glass" /> Search <kbd className="rounded bg-line/60 px-1 text-[10px]">⌘K</kbd>
          </button>
          <ThemeToggle className="text-brand" />
        </div>
        <main className="p-6">{mustChange ? <Navigate to="/admin/account/password" replace /> : <><div className="mb-4"><Breadcrumbs bar={false} root={{ label: 'Dashboard', to: '/admin' }} /></div><Outlet /></>}</main>
      </div>
      <AdminSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}