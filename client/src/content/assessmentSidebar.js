import { ASSESSMENT_ACCREDITATION, NAAC_ITEMS } from './nav.js';

// Builds the grouped sidebar shown on all NAAC / Assessment & Accreditation pages.
// Shape matches <Sidebar groups={...}> : [{ label, items: [{ to, label, icon }] }]
export const ASSESSMENT_SIDEBAR_GROUPS = [
  ...ASSESSMENT_ACCREDITATION.map((group) => ({
    label: group.label,
    items: group.children.map(([, label, slug]) => ({ to: `/assessment/${slug}`, label, icon: 'fa-circle-dot' })),
  })),
  {
    label: 'NAAC',
    items: [
      ...NAAC_ITEMS.map(([, label, slug]) => ({ to: `/naac/${slug}`, label, icon: 'fa-circle-dot' })),
      { to: '/naac/ssr', label: 'Self Study Report (SSR)', icon: 'fa-file-lines' },
    ],
  },
];
