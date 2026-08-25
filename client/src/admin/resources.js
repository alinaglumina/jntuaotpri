// Client resource manifest — the single config that drives every admin panel.
// One <CrudSection> renders any of these from its `fields`. Add a resource here
// (matching a server registry key) and a fully working panel appears.
// field types: text | textarea | html | number | date | checkbox | select | file | image

import { DIRECTORATES } from '../content/nav.js';

const F = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const DIRECTORATE_OPTIONS = DIRECTORATES.map(([, label, slug]) => ({ value: slug, label }));
const directorateField = () => F('directorateKey', 'Directorate', 'select', { options: DIRECTORATE_OPTIONS, required: true });

export const GROUPS = [
  { id: 'content', label: 'Content' },
  { id: 'institutional', label: 'Institutional' },
  { id: 'academics', label: 'Academics' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'system', label: 'System' },
];

const CAT = [
  { value: 'news', label: 'News' },
  { value: 'live-news', label: 'Live News' },
  { value: 'exam', label: 'Examinations' },
  { value: 'admission', label: 'Admissions' },
  { value: 'research', label: 'R&D' },
  { value: 'placement', label: 'Placements' },
  { value: 'sports', label: 'Sports' },
  { value: 'tenders', label: 'Tenders' },
];

export const RESOURCES = {
  notifications: {
    label: 'Notifications', group: 'content', icon: 'fa-bell', roles: ['admin', 'director', 'examiner'],
    columns: ['title', 'category', 'publishedAt'],
    fields: [directorateField(), F('title', 'Title'), F('category', 'Category', 'multiselect', { options: CAT }),
             F('publishedAt', 'Date', 'date'),
             F('attachments', 'Attachments', 'files', { max: 8 }), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  news: {
    label: 'News', group: 'content', icon: 'fa-newspaper', roles: ['admin', 'director'],
    columns: ['title', 'category', 'isPublished', 'createdAt'],
    fields: [directorateField(), F('title', 'Title'), F('category', 'Category'), F('content', 'Content', 'html'),
             F('attachment', 'Attachment', 'file'), F('isPublished', 'Published', 'checkbox', { default: true })],
  },
  gallery: {
    label: 'Gallery', group: 'content', icon: 'fa-images', roles: ['admin', 'director'],
    columns: ['caption', 'category', 'uploadedAt'],
    fields: [directorateField(), F('filename', 'Image', 'image', { required: true }), F('caption', 'Caption'), F('category', 'Category')],
  },
  emagazines: {
    label: 'E-Magazines', group: 'content', icon: 'fa-book-open', roles: ['admin', 'director'],
    columns: ['monthYear', 'issueDate'],
    fields: [directorateField(), F('monthYear', 'Month / Year', 'text', { required: true }), F('issueDate', 'Issue date', 'date'),
             F('filename', 'PDF / link', 'file')],
  },
  slides: {
    label: 'Homepage Slider', group: 'content', icon: 'fa-panorama', roles: ['admin'],
    columns: ['title', 'order', 'isActive'],
    fields: [F('image', 'Slide image', 'image', { required: true }), F('badge', 'Badge'), F('title', 'Heading'),
             F('subtext', 'Sub-text'), F('order', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  administration: {
    label: 'Administration', group: 'institutional', icon: 'fa-user-tie', roles: ['admin'],
    columns: ['roleKey', 'name', 'designation'],
    fields: [F('roleKey', 'Role key', 'select', { options: ['chancellor', 'vc', 'rector', 'registrar'], required: true }),
             F('name', 'Name'), F('designation', 'Designation'), F('photo', 'Photo', 'image'), F('profileText', 'Profile', 'html'),
             F('attachment', 'Profile Attachment URL (upload PDF via Media Library first, then paste its URL here)')],
  },
  'executive-council': {
    label: 'Executive Council', group: 'institutional', icon: 'fa-users', roles: ['admin'],
    columns: ['name', 'designation', 'sortOrder'],
    fields: [F('name', 'Name', 'text', { required: true }), F('designation', 'Designation'),
             F('photo', 'Photo', 'image'), F('sortOrder', 'Order', 'number'),
             F('isActive', 'Active', 'checkbox', { default: true })],
  },
  'former-vice-chancellors': {
    label: 'Former Vice-Chancellors', group: 'institutional', icon: 'fa-user-tie', roles: ['admin'],
    columns: ['name', 'tenure', 'sortOrder'],
    fields: [F('name', 'Name', 'text', { required: true }), F('tenure', 'Tenure (e.g. 2015–2019)'),
             F('photo', 'Photo', 'image'), F('profileText', 'Profile', 'html'),
             F('sortOrder', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  'directorate-content': {
    label: 'Directorate Pages', group: 'institutional', icon: 'fa-building-columns', roles: ['admin', 'director'],
    columns: ['directorateKey', 'directorName'],
    fields: [F('directorateKey', 'Directorate key', 'text', { required: true }), F('directorName', 'Director name'),
             F('directorDesignation', 'Designation'), F('directorPhoto', 'Photo', 'image'), F('aboutText', 'About', 'html')],
  },
  'nav-menu': {
    label: 'Header Menu', group: 'system', icon: 'fa-bars', roles: ['admin'],
    columns: ['label', 'key', 'parentKey', 'order'],
    fields: [
      F('label', 'Label (text shown in the menu)', 'text', { required: true }),
      F('key', 'Key (unique, e.g. "about-genesis")', 'text', { required: true }),
      F('parentKey', 'Parent key (blank = top-level group; e.g. "about" for a sub-item)'),
      F('to', 'Link URL (leave blank if this is a group/dropdown, not a clickable page)'),
      F('order', 'Order', 'number'),
      F('wide', 'Wide dropdown (top-level groups only)', 'checkbox'),
      F('isActive', 'Active', 'checkbox', { default: true }),
    ],
  },
  'directorate-menu': {
    label: 'Menu Items', group: 'institutional', icon: 'fa-bars', roles: ['admin', 'director'],
    columns: ['label', 'menuKey', 'type', 'sortOrder'],
    fields: [directorateField(),
             F('label', 'Menu label (e.g. "Syllabus")', 'text', { required: true }),
             F('menuKey', 'URL key (e.g. "syllabus")', 'text', { required: true }),
             F('type', 'Type', 'select', { options: [
               { value: 'page', label: 'Content page (write text here)' },
               { value: 'resource', label: 'Linked resource (e.g. Notifications)' },
               { value: 'link', label: 'External URL' },
             ] }),
             F('body', 'Page content (only if Type = Content page)', 'html'),
             F('linkResource', 'Resource key (only if Type = Linked resource, e.g. "notifications")'),
             F('externalUrl', 'External URL (only if Type = External URL)'),
             F('sortOrder', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  faculty: {
    label: 'Faculty', group: 'institutional', icon: 'fa-chalkboard-user', roles: ['admin', 'director'],
    columns: ['name', 'designation', 'department'],
    fields: [F('name', 'Name', 'text', { required: true }), F('designation', 'Designation'), F('department', 'Department'),
             F('qualification', 'Qualification'), F('specialization', 'Specialization'), F('email', 'Email'),
             F('mobile', 'Mobile'), F('photo', 'Photo', 'image'), F('sortOrder', 'Order', 'number'),
             F('isActive', 'Active', 'checkbox', { default: true })],
  },
  honoris: {
    label: 'Honoris Causa', group: 'institutional', icon: 'fa-award', roles: ['admin'],
    columns: ['name', 'honorDegree', 'convocationDate'],
    fields: [F('name', 'Name', 'text', { required: true }), F('honorDegree', 'Degree'), F('convocationDate', 'Convocation date', 'date')],
  },
  regulations: {
    label: 'Regulations', group: 'academics', icon: 'fa-scroll', roles: ['admin'],
    columns: ['code', 'sortOrder'],
    fields: [F('code', 'Code (e.g. R21)', 'text', { required: true }), F('sortOrder', 'Order', 'number')],
  },
  senate: {
    label: 'Senate Documents', group: 'academics', icon: 'fa-file-signature', roles: ['admin', 'director'],
    columns: ['title', 'createdAt'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('filename', 'Document', 'file'), F('url', 'External URL')],
  },
  dacp: {
    label: 'DACP Files', group: 'academics', icon: 'fa-folder-open', roles: ['admin', 'director'],
    columns: ['title', 'section', 'regulation'],
    fields: [F('title', 'Title', 'text', { required: true }), F('section', 'Section'), F('programme', 'Programme'),
             F('regulation', 'Regulation'), F('filename', 'File', 'file'), F('isNewItem', 'Mark as new', 'checkbox')],
  },
  'dafa-docs': {
    label: 'Directorate Documents', group: 'academics', icon: 'fa-file-lines', roles: ['admin', 'director'],
    columns: ['title', 'section', 'createdAt'],
    fields: [F('section', 'Section key', 'text', { required: true }), F('title', 'Title', 'text', { required: true }),
             F('filename', 'Document', 'file'), F('sortOrder', 'Order', 'number')],
  },
  'page-content': {
    label: 'Editable Pages', group: 'institutional', icon: 'fa-file-pen', roles: ['admin', 'director'],
    columns: ['key', 'heading'],
    fields: [F('key', 'Page key', 'text', { required: true }), F('heading', 'Heading'), F('body', 'Body', 'html')],
  },
  mous: {
    label: 'Tie-Ups & MOUs', group: 'collaboration', icon: 'fa-handshake', roles: ['admin', 'director'],
    columns: ['orgName', 'mouType', 'mouDate'],
    fields: [directorateField(), F('orgName', 'Organization', 'text', { required: true }),
             F('mouType', 'Type', 'select', { options: ['National', 'International'] }),
             F('mouDate', 'Date', 'date'), F('document', 'Document', 'file'), F('isActive', 'Active', 'checkbox', { default: true })],
  },

  events: {
    label: 'Events', group: 'content', icon: 'fa-calendar-day', roles: ['admin'],
    columns: ['title', 'startDate', 'venue'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('category', 'Category'),
             F('startDate', 'Start date', 'date', { required: true }), F('endDate', 'End date', 'date'),
             F('venue', 'Venue'), F('description', 'Description', 'html'), F('banner', 'Banner', 'image'),
             F('images', 'Homepage Slider Images (min 4)', 'images', { min: 4, max: 8 }),
             F('registrationUrl', 'Registration URL'), F('isPublished', 'Published', 'checkbox', { default: true })],
  },
  circulars: {
    label: 'Circulars', group: 'content', icon: 'fa-file-circle-exclamation', roles: ['admin', 'director'],
    columns: ['title', 'refNo', 'circularDate'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('refNo', 'Reference No.'),
             F('category', 'Category'), F('circularDate', 'Date', 'date'),
             F('attachment', 'PDF', 'file'), F('isNewItem', 'Mark as new', 'checkbox'),
             F('isActive', 'Active', 'checkbox', { default: true })],
  },
  downloads: {
    label: 'Downloads', group: 'content', icon: 'fa-download', roles: ['admin', 'director'],
    columns: ['title', 'category', 'section'],
    fields: [F('title', 'Title', 'text', { required: true }), F('category', 'Category'),
             F('section', 'Section'), F('attachment', 'File', 'file'), F('sortOrder', 'Order', 'number'),
             F('isActive', 'Active', 'checkbox', { default: true })],
  },
  departments: {
    label: 'Departments', group: 'institutional', icon: 'fa-sitemap', roles: ['admin'],
    columns: ['name', 'code', 'college'],
    fields: [F('name', 'Name', 'text', { required: true }), F('code', 'Code'), F('college', 'College / School'),
             F('hod', 'Head of Dept.'), F('description', 'Description', 'html'), F('website', 'Website'),
             F('email', 'Email'), F('sortOrder', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  students: {
    label: 'Students', group: 'institutional', icon: 'fa-user-graduate', roles: ['admin', 'director'],
    columns: ['name', 'rollNo', 'category'],
    fields: [F('name', 'Name', 'text', { required: true }), F('rollNo', 'Roll No.'), F('programme', 'Programme'),
             F('branch', 'Branch'), F('year', 'Year'), F('category', 'Category'), F('email', 'Email'), F('photo', 'Photo', 'image')],
  },
  menus: {
    label: 'Menus', group: 'system', icon: 'fa-bars', roles: ['admin'],
    columns: ['label', 'location', 'order'],
    fields: [F('label', 'Label', 'text', { required: true }), F('url', 'URL'),
             F('location', 'Location', 'select', { options: ['header', 'footer', 'quick'] }),
             F('target', 'Target', 'select', { options: ['_self', '_blank'] }), F('order', 'Order', 'number'),
             F('isActive', 'Active', 'checkbox', { default: true })],
  },

  admissions: {
    label: 'Admissions', group: 'content', icon: 'fa-user-plus', roles: ['admin', 'director'],
    columns: ['title', 'programme', 'status'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('programme', 'Programme', 'text', { required: true }),
             F('academicYear', 'Academic year'), F('category', 'Category', 'select', { options: ['UG', 'PG', 'PhD', 'Diploma', 'Other'] }),
             F('description', 'Description', 'html'), F('openDate', 'Open date', 'date'), F('closeDate', 'Close date', 'date'),
             F('applyUrl', 'Apply URL'), F('attachment', 'Notification PDF', 'file'),
             F('status', 'Status', 'select', { options: ['open', 'closed', 'upcoming'] }),
             F('isPublished', 'Published', 'checkbox', { default: true })],
  },
  examinations: {
    label: 'Examinations', group: 'academics', icon: 'fa-file-pen', roles: ['admin', 'director'],
    columns: ['title', 'examType', 'examDate'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }),
             F('examType', 'Type', 'select', { options: ['Regular', 'Supplementary', 'Revaluation', 'Recounting', 'Fee', 'TimeTable', 'Other'] }),
             F('regulation', 'Regulation'), F('programme', 'Programme'), F('semester', 'Semester'),
             F('examDate', 'Exam date', 'date'), F('lastDate', 'Last date', 'date'),
             F('attachment', 'PDF', 'file'), F('notes', 'Notes', 'html'), F('isPublished', 'Published', 'checkbox', { default: true })],
  },
  results: {
    label: 'Results', group: 'academics', icon: 'fa-square-poll-vertical', roles: ['admin', 'director'],
    columns: ['title', 'programme', 'publishedOn'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('regulation', 'Regulation'), F('programme', 'Programme'),
             F('semester', 'Semester'), F('month', 'Month/Year'), F('resultUrl', 'Results portal URL'),
             F('attachment', 'PDF', 'file'), F('publishedOn', 'Published on', 'date'),
             F('isPublished', 'Published', 'checkbox', { default: true })],
  },
  'content-blocks': {
    label: 'Dynamic Content', group: 'system', icon: 'fa-cubes', roles: ['admin'],
    columns: ['key', 'type', 'page'],
    fields: [F('key', 'Key (e.g. home.hero)', 'text', { required: true }),
             F('type', 'Type', 'select', { options: ['html', 'text', 'json', 'list', 'image'] }),
             F('page', 'Page/section'), F('title', 'Title'), F('body', 'Body', 'html'),
             F('order', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },

  videos: {
    label: 'Video Gallery', group: 'content', icon: 'fa-video', roles: ['admin', 'director'],
    columns: ['title', 'provider', 'category'],
    fields: [directorateField(), F('title', 'Title', 'text', { required: true }), F('url', 'Video URL', 'text', { required: true }),
             F('provider', 'Provider', 'select', { options: ['youtube', 'vimeo', 'file'] }),
             F('thumbnail', 'Thumbnail', 'image'), F('category', 'Category'), F('description', 'Description', 'textarea'),
             F('sortOrder', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
  seo: {
    label: 'SEO', group: 'system', icon: 'fa-magnifying-glass-chart', roles: ['admin'],
    columns: ['path', 'title'],
    fields: [F('path', 'Path (e.g. /about/genesis)', 'text', { required: true }), F('title', 'Meta title'),
             F('description', 'Meta description', 'textarea'), F('keywords', 'Keywords'),
             F('ogImage', 'OG image', 'image'), F('canonical', 'Canonical URL'), F('noindex', 'No-index', 'checkbox')],
  },
  'naac-documents': {
    label: 'NAAC Documents', group: 'institutional', icon: 'fa-table-list', roles: ['admin'],
    columns: ['criteria', 'metricNumber', 'title', 'sortOrder'],
    fields: [F('criteria', 'Criteria / Section', 'select', { required: true, options: [
               { value: 'extended-profile', label: 'Extended Profile Metrics' },
               { value: 'criteria-1', label: 'Criteria 1' },
               { value: 'criteria-2', label: 'Criteria 2' },
               { value: 'criteria-3', label: 'Criteria 3' },
               { value: 'criteria-4', label: 'Criteria 4' },
               { value: 'criteria-5', label: 'Criteria 5' },
               { value: 'criteria-6', label: 'Criteria 6' },
               { value: 'criteria-7', label: 'Criteria 7' },
               { value: 'workshops-seminars', label: 'Workshops / Seminars' },
               { value: 'ssr', label: 'Self Study Report (SSR)' },
             ] }),
             F('metricNumber', 'Criteria/Metric Number (e.g. 1.1)', 'text'),
             F('title', 'Title', 'text', { required: true }),
             F('attachment', 'Attachment (PDF)', 'file'),
             F('sortOrder', 'Order', 'number'), F('isActive', 'Active', 'checkbox', { default: true })],
  },
};
