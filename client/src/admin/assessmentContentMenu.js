import { ASSESSMENT_ACCREDITATION } from '../content/nav.js';

// Curated admin sidebar group mirroring the public Assessment & Accreditation /
// NAAC sidebar. Each item deep-links into the page-content editor by key.
export const ASSESSMENT_ADMIN_GROUPS = [
  ...ASSESSMENT_ACCREDITATION.map((group) => ({
    label: group.label,
    items: group.children.map(([id, label]) => ({ id, label })),
  })),
];

import { ACADEMICS } from '../content/nav.js';

export const ACADEMICS_ADMIN_GROUPS = [
  {
    label: 'Academics',
    // 'acad-downloads' is excluded: that page now renders a table via the
    // Downloads resource (Section = "academics-downloads"), not page-content.
    items: ACADEMICS.filter(([id]) => id !== 'acad-downloads').map(([id, label]) => ({ id, label })),
  },
];
