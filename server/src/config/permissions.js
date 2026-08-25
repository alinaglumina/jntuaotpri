// Central permission catalog. Format: '<resource>:<action>'. `*` = all.
export const PERMISSIONS = [
  'notifications:write', 'news:write', 'circulars:write', 'downloads:write',
  'events:write', 'gallery:write', 'emagazines:write', 'slides:write',
  'faculty:write', 'departments:write', 'students:write',
  'mous:write', 'senate:write', 'regulations:write', 'dacp:write',
  'dafa-docs:write', 'page-content:write', 'administration:write',
  'directorate-content:write', 'honoris:write', 'menus:write',
  'videos:write', 'seo:write', 'messages:manage', 'backup:manage', 'profile:edit',
  'media:manage', 'users:manage', 'roles:manage', 'settings:write', 'logs:read',
];

// System roles seeded on startup.
export const SYSTEM_ROLES = {
  admin: { label: 'Super Administrator', permissions: ['*'], isSystem: true },
  director: {
    label: 'Directorate Manager', isSystem: true,
    permissions: [
      'notifications:write', 'news:write', 'circulars:write', 'downloads:write',
      'events:write', 'gallery:write', 'emagazines:write', 'faculty:write',
      'departments:write', 'students:write', 'mous:write', 'senate:write',
      'dacp:write', 'dafa-docs:write', 'page-content:write', 'directorate-content:write', 'videos:write', 'profile:edit',
    ],
  },
};

// A user has a permission if their role grants '*' or the exact permission.
export function roleHasPermission(rolePerms = [], perm) {
  return rolePerms.includes('*') || rolePerms.includes(perm);
}
