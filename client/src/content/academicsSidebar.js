import { ACADEMICS } from './nav.js';

export const ACADEMICS_SIDEBAR_GROUPS = [
  {
    label: 'Academics',
    items: ACADEMICS.map(([, label, slug]) => ({ to: `/academics/${slug}`, label, icon: 'fa-circle-dot' })),
  },
];
