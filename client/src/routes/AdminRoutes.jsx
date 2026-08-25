import { lazy } from 'react';
import { RoleRoute } from './guards.jsx';
import { S } from './lazy.jsx';
import { RESOURCES } from '../admin/resources.js';
import Forbidden from '../pages/errors/Forbidden.jsx';
import { resourceLoader, overviewLoader } from './loaders.js';

const Dashboard      = lazy(() => import('../admin/Dashboard.jsx'));
const CrudSection    = lazy(() => import('../admin/CrudSection.jsx'));
const MediaLibrary   = lazy(() => import('../admin/MediaLibrary.jsx'));
const Users          = lazy(() => import('../admin/Users.jsx'));
const ChangePassword = lazy(() => import('../admin/ChangePassword.jsx'));
const RolesPermissions = lazy(() => import('../admin/RolesPermissions.jsx'));
const Settings       = lazy(() => import('../admin/Settings.jsx'));
const AuditLogs      = lazy(() => import('../admin/AuditLogs.jsx'));
const Profile        = lazy(() => import('../admin/Profile.jsx'));
const LoginHistory   = lazy(() => import('../admin/LoginHistory.jsx'));
const MessagesInbox  = lazy(() => import('../admin/MessagesInbox.jsx'));
const Backup         = lazy(() => import('../admin/Backup.jsx'));
const PageBuilder    = lazy(() => import('../admin/PageBuilder.jsx'));
const MenuManager    = lazy(() => import('../admin/MenuManager.jsx'));

const resourceLabel = (key) => RESOURCES[key]?.label || key;

export const adminChildren = [
  { index: true, element: S(<Dashboard />), loader: overviewLoader },
  { path: 'r/:resource', element: S(<CrudSection />), loader: resourceLoader,
    handle: { crumb: (m) => [{ label: resourceLabel(m.params.resource) }] } },

  { path: 'page-builder', element: <RoleRoute roles={['admin']}>{S(<PageBuilder />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Page Builder' }] } },
  { path: 'menus-manager', element: <RoleRoute roles={['admin']}>{S(<MenuManager />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Menu Management' }] } },
  { path: 'media', element: <RoleRoute roles={['admin']}>{S(<MediaLibrary />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Media Library' }] } },
  { path: 'messages', element: <RoleRoute roles={['admin']}>{S(<MessagesInbox kind="contact-messages" title="Contact Messages" statuses={['new', 'read', 'archived']} />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Contact Messages' }] } },
  { path: 'enquiries', element: <RoleRoute roles={['admin']}>{S(<MessagesInbox kind="enquiries" title="Enquiries" statuses={['new', 'in-progress', 'resolved']} />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Enquiries' }] } },
  { path: 'roles', element: <RoleRoute roles={['admin']}>{S(<RolesPermissions />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Roles & Permissions' }] } },
  { path: 'users', element: <RoleRoute roles={['admin']}>{S(<Users />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Users' }] } },
  { path: 'settings', element: <RoleRoute roles={['admin']}>{S(<Settings />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Settings' }] } },
  { path: 'logs', element: <RoleRoute roles={['admin']}>{S(<AuditLogs />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Audit Logs' }] } },
  { path: 'backup', element: <RoleRoute roles={['admin']}>{S(<Backup />)}</RoleRoute>, handle: { crumb: () => [{ label: 'Backup' }] } },

  { path: 'profile', element: S(<Profile />), handle: { crumb: () => [{ label: 'Profile' }] } },
  { path: 'login-history', element: S(<LoginHistory />), handle: { crumb: () => [{ label: 'Login History' }] } },
  { path: 'account/password', element: S(<ChangePassword />), handle: { crumb: () => [{ label: 'Change Password' }] } },
  { path: '403', element: <Forbidden /> },
];
