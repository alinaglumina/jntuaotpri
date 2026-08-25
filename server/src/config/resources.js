import {
  Notification, News, GalleryItem, Mou, EMagazine, Slide, Faculty,
  Administration, ExecutiveCouncil, FormerViceChancellor, DirectorateContent, HonorisCausa, SenateDoc, Regulation,
  DacpFile, DafaDoc, PageContent,
  Event, Department, Student, Circular, Download, Menu,
  Admission, Examination, Result, ContentBlock,
  Video, SeoMeta, NaacDocument, DirectorateMenuItem, NavMenuItem,
} from '../models/index.js';

// Each entry: model + upload config + which roles may write + list search fields.
// `uploadField`/`uploadSubdir` enable file uploads on create/update.
// `sectionField` marks resources a director can only edit within their scope.
export const RESOURCES = {
  notifications:       { model: Notification,       uploadMulti: ['attachments', 'documents', 8], searchable: ['title'], roles: ['admin', 'director', 'examiner'], sectionField: 'directorateKey' },
  news:                { model: News,               upload: ['attachment', 'documents'], searchable: ['title'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  gallery:             { model: GalleryItem,        upload: ['filename', 'gallery'],     searchable: ['caption'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  mous:                { model: Mou,                upload: ['document', 'mous'],         searchable: ['orgName'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  emagazines:          { model: EMagazine,          upload: ['filename', 'magazines'],   searchable: ['monthYear'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  slides:              { model: Slide,              upload: ['image', 'slider'],         roles: ['admin'] },
  faculty:             { model: Faculty,            upload: ['photo', 'images'],         searchable: ['name', 'department'], roles: ['admin', 'director'] },
  administration:      { model: Administration,     upload: ['photo', 'images'],         roles: ['admin'] },
  'executive-council':        { model: ExecutiveCouncil,      upload: ['photo', 'images'], searchable: ['name'], roles: ['admin'] },
  'former-vice-chancellors':  { model: FormerViceChancellor,  upload: ['photo', 'images'], searchable: ['name'], roles: ['admin'] },
  'directorate-content': { model: DirectorateContent, upload: ['directorPhoto', 'images'], searchable: ['directorName'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  'directorate-menu':    { model: DirectorateMenuItem, searchable: ['label', 'menuKey'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  'nav-menu':            { model: NavMenuItem, searchable: ['label', 'key'], roles: ['admin'] },
  honoris:             { model: HonorisCausa,       searchable: ['name'], roles: ['admin'] },
  senate:              { model: SenateDoc,          upload: ['filename', 'senate'],      searchable: ['title'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  regulations:         { model: Regulation,         roles: ['admin'] },
  dacp:                { model: DacpFile,           upload: ['filename', 'dacp'],        searchable: ['title', 'section'], roles: ['admin', 'director'], sectionField: 'section' },
  'dafa-docs':         { model: DafaDoc,            upload: ['filename', 'dafa-docs'],   searchable: ['title', 'section'], roles: ['admin', 'director'], sectionField: 'section' },
  'page-content':      { model: PageContent,        searchable: ['key', 'heading'],      roles: ['admin', 'director'], sectionField: 'key' },

  events:              { model: Event,            upload: ['banner', 'events'],  uploadMulti: ['images', 'events', 8],  searchable: ['title', 'category'], roles: ['admin'], sectionField: 'directorateKey' },
  circulars:           { model: Circular,         upload: ['attachment', 'circulars'], searchable: ['title', 'refNo'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  downloads:           { model: Download,         upload: ['attachment', 'downloads'], searchable: ['title', 'category'], roles: ['admin', 'director'], sectionField: 'section' },
  departments:         { model: Department,       searchable: ['name', 'code'], roles: ['admin'] },
  students:            { model: Student,          upload: ['photo', 'images'], searchable: ['name', 'rollNo'], roles: ['admin', 'director'], sectionField: 'category' },
  menus:               { model: Menu,             searchable: ['label'], roles: ['admin'] },

  admissions:          { model: Admission,        upload: ['attachment', 'admissions'], searchable: ['title', 'programme'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  examinations:        { model: Examination,      upload: ['attachment', 'exams'],      searchable: ['title', 'regulation'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  results:             { model: Result,           upload: ['attachment', 'results'],    searchable: ['title', 'programme'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  'content-blocks':    { model: ContentBlock,      searchable: ['key', 'title'], roles: ['admin'] },

  videos:              { model: Video,            upload: ['thumbnail', 'videos'], searchable: ['title', 'category'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  seo:                 { model: SeoMeta,          upload: ['ogImage', 'seo'],      searchable: ['path', 'title'], roles: ['admin'] },
  'naac-documents':    { model: NaacDocument,     upload: ['attachment', 'naac'],  searchable: ['title'], roles: ['admin'] },
};
