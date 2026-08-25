// Single source of truth for the public site map. Drives BOTH the mega-menu
// and the router. `content` = renders ContentPage from pages.json by that id.
// `dynamic` = a custom data-driven component (see router.jsx).

export const DIRECTORATES = [
  ['dir-academic', 'Academic & Planning', 'academic'],
  ['dir-audit', 'Academic Audit', 'audit'],
  ['dir-admissions', 'Admissions', 'admissions'],
  ['dir-foreign-affairs-alumni', 'Foreign Affairs & Alumni Matters', 'foreign-affairs-alumni'],
  ['dir-evaluation', 'Evaluation', 'evaluation'],
  ['dir-rd', 'Research & Development', 'rd'],
  ['dir-placements', 'IR, Placements & Sponsored Research', 'placements'],
  ['dir-consultancy', 'Industrial Consultancy Services', 'consultancy'],
  ['dir-faculty', 'Faculty Development & Women Empowerment', 'faculty'],
  ['dir-iqac', 'Internal Quality Assurance Cell', 'iqac'],
  ['dir-skill', 'Skill, Software Development & Incubation Centre', 'skill'],
  ['dir-ipr', 'Intellectual Property Rights', 'ipr'],
  ['dir-otpri', 'Oil Technological & Pharmaceutical Research Institute', 'otpri'],
  ['dir-sms', 'School of Management Studies', 'sms'],
];

export const UNITS = [
  ['unit-nss', 'NSS Cell', 'nss'],
  ['unit-scst', 'SC/ST Cell', 'scst'],
  ['unit-anti-ragging', 'Anti-Ragging Cell', 'anti-ragging'],
  ['unit-pro', 'Public Relations Office', 'public-relations'],
  ['unit-sports', 'Sports Council', 'sports'],
];

export const ASSESSMENT_ACCREDITATION = [
  {
    label: 'IQAC',
    children: [
      ['aa-iqac-about', 'About IQAC', 'iqac/about'],
      ['aa-iqac-functions', 'Functions of IQAC', 'iqac/functions'],
      ['aa-iqac-benefits', 'Benefits of IQAC', 'iqac/benefits'],
      ['aa-iqac-initiatives', 'Important Initiatives started at JNTUA', 'iqac/initiatives'],
    ],
  },
  {
    label: 'AISHE',
    children: [
      ['aa-aishe-jntua', 'JNTUA AISHE', 'aishe/jntua'],
      ['aa-aishe-reports', 'AISHE Reports', 'aishe/reports'],
    ],
  },
  {
    label: 'NIRF',
    children: [
      ['aa-nirf-jntua', 'JNTUA NIRF', 'nirf/jntua'],
      ['aa-nirf-reports', 'NIRF Reports', 'nirf/reports'],
    ],
  },
];

export const NAAC_ITEMS = [
  ['naac-extended-profile', 'Extended Profile Metrics', 'extended-profile'],
  ['naac-criteria-1', 'Criteria 1', 'criteria-1'],
  ['naac-criteria-2', 'Criteria 2', 'criteria-2'],
  ['naac-criteria-3', 'Criteria 3', 'criteria-3'],
  ['naac-criteria-4', 'Criteria 4', 'criteria-4'],
  ['naac-criteria-5', 'Criteria 5', 'criteria-5'],
  ['naac-criteria-6', 'Criteria 6', 'criteria-6'],
  ['naac-criteria-7', 'Criteria 7', 'criteria-7'],
  ['naac-workshops', 'Workshops / Seminars', 'workshops-seminars'],
  ['naac-ssr', 'Self Study Report (SSR)', 'ssr'],
];

export const ACADEMICS = [
  ['acad-methodology', 'Methodology', 'methodology'],
  ['acad-admission', 'Admission', 'admission'],
  ['acad-regsyllabus', 'Regulations & Syllabus', 'regulations-syllabus'],
  ['acad-examinations', 'Examinations', 'examinations'],
  ['acad-downloads', 'Downloadable Documents', 'downloads'],
  ['acad-examcal', 'Exam Calendars', 'exam-calendars'],
  ['acad-affiliated', 'Affiliated Colleges', 'affiliated-colleges'],
];

// Mega-menu structure. leaf: { label, to, kind } kind: content|dynamic|external
export const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    children: [
      { label: 'Genesis-JNTUA', to: '/about/genesis', kind: 'content', id: 'genesis' },
      { label: 'Vision & Mission', to: '/about/vision-mission', kind: 'content', id: 'vision-mission' },
      { label: 'University Goals', to: '/about/goals', kind: 'content', id: 'goals' },
      { label: 'JNTUA Policies', to: '/about/policies', kind: 'content', id: 'policies' },
      { label: 'Honoris Causa', to: '/about/honoris', kind: 'dynamic' },
      { label: 'JNTUA Gallery', to: '/about/gallery', kind: 'dynamic' },
      { label: "Tie Up's & MOU's", to: '/about/mous', kind: 'dynamic' },
      { label: 'E-Magazines', to: '/about/e-magazines', kind: 'dynamic' },
      { label: 'JNTUA Anthem', to: '/about/anthem', kind: 'content', id: 'anthem' },
    ],
  },
  {
    label: 'Administration',
    children: [
      { label: 'Chancellor', to: '/administration/chancellor', kind: 'content', id: 'chancellor' },
      { label: 'Vice-Chancellor', to: '/administration/vice-chancellor', kind: 'content', id: 'vice-chancellor' },
      { label: 'Rector', to: '/administration/rector', kind: 'content', id: 'rector' },
      { label: 'Registrar', to: '/administration/registrar', kind: 'content', id: 'registrar' },
      { label: 'Executive Council', to: '/administration/executive-council', kind: 'content', id: 'exec-council' },
      { label: 'Former Vice-Chancellors', to: '/administration/former-vice-chancellors', kind: 'content', id: 'former-vcs' },
    ],
  },
  {
    label: 'Directorates',
    wide: true,
    children: DIRECTORATES.map(([id, label, slug]) => ({
      label, to: `/directorates/${slug}`, kind: 'content', id,
    })),
  },
  {
  label: 'Assessment & Accreditation',
  children: ASSESSMENT_ACCREDITATION.map((group) => ({
    label: group.label,
    children: group.children.map(([id, label, slug]) => ({
      label, to: `/assessment/${slug}`, kind: 'content', id,
    })),
  })),
},
  {
  label: 'NAAC',
  children: NAAC_ITEMS.map(([id, label, slug]) => ({
    label, to: `/naac/${slug}`, kind: 'content', id,
  })),
},
  {
    label: 'Academics',
    children: ACADEMICS.map(([id, label, slug]) => ({
      label, to: `/academics/${slug}`, kind: 'dynamic', id,
    })),
  },
  {
    label: 'Important Units',
    children: UNITS.map(([id, label, slug]) => ({
      label, to: `/units/${slug}`, kind: 'content', id,
    })),
  },
];

export const RIBBON_LINKS = [
  { label: 'Notification Centre', to: '/notifications', icon: 'fa-bell' },
  { label: 'Alumni', to: '/alumni', icon: 'fa-user-graduate' },
  { label: 'Faculty Corner', to: '/administration/faculty', icon: 'fa-chalkboard-user' },
];

export const SOCIALS = [
  ['facebook-f', 'https://facebook.com/jntua'],
  ['x-twitter', 'https://twitter.com/jntua'],
  ['linkedin-in', 'https://linkedin.com/school/jntua'],
  ['youtube', 'https://youtube.com/jntua'],
  ['instagram', 'https://instagram.com/jntua'],
];
