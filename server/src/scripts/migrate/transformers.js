import fs from 'fs';
import path from 'path';

// ── helpers ───────────────────────────────────────────────────────────────
const toDate = (v) => {
  if (!v || v === '0000-00-00' || v === '0000-00-00 00:00:00') return null;
  const d = new Date(String(v).replace(' ', 'T'));
  return isNaN(d) ? null : d;
};
const bool = (v) => v === 1 || v === '1' || v === true;
const str = (v) => (v == null ? '' : String(v));

// Rewrite any asset reference to the new public base. Handles absolute legacy
// URLs, protocol-relative, and bare filenames (mapped into a known subdir).
export function makeUrlRewriter(assetBase) {
  const base = (assetBase || '').replace(/\/$/, '');
  return function rewrite(value, defaultSubdir = 'documents') {
    if (!value) return '';
    let v = String(value).trim();
    if (/^https?:\/\/(heyzine|youtu|youtube|drive\.google)/i.test(v)) return v; // external services kept as-is
    const idx = v.indexOf('/uploads/');
    if (idx !== -1) return `${base}${v.slice(idx)}`.replace(/([^:])\/\/+/g, '$1/');
    if (/^https?:\/\//i.test(v)) return v;             // other absolute URL — leave
    if (v.includes('/')) return `${base}/${v.replace(/^\/+/, '')}`;
    return `${base}/uploads/${defaultSubdir}/${v}`;    // bare filename
  };
}

// ── User map (MySQL int id → username), for resolving content FKs ──────────
export function buildUserData(sql) {
  const idToUsername = {};
  const usersOut = [];
  const seen = new Set();

  for (const r of sql.admin_users || []) {
    idToUsername[`admin:${r.id}`] = r.username;
    if (seen.has(r.username)) continue;
    seen.add(r.username);
    usersOut.push({
      username: str(r.username).toLowerCase(),
      email: str(r.email).toLowerCase(),
      passwordHash: str(r.password_hash || r.password),
      fullName: str(r.full_name),
      role: r.role === 'admin' ? 'admin' : 'director',
      directorate: str(r.directorate || ''),
      isActive: r.is_active == null ? bool(r.active) : bool(r.is_active),
      mustChangePwd: bool(r.must_change_pwd),
      lastLogin: toDate(r.last_login),
      _legacy: { table: 'admin_users', id: r.id },
    });
  }
  for (const r of sql.users || []) {
    idToUsername[`users:${r.id}`] = r.username;
    if (seen.has(str(r.username).toLowerCase())) continue;
    seen.add(str(r.username).toLowerCase());
    usersOut.push({
      username: str(r.username).toLowerCase(),
      email: str(r.email).toLowerCase(),
      passwordHash: str(r.password),
      fullName: str(r.full_name),
      role: r.role === 'admin' ? 'admin' : 'director',
      directorate: r.role?.startsWith('dir-') ? r.role.slice(4) : '',
      isActive: bool(r.is_active),
      lastLogin: toDate(r.last_login),
      _legacy: { table: 'users', id: r.id },
    });
  }
  return { usersOut, idToUsername };
}

// Resolve a legacy created_by/updated_by int → username (prefers admin_users).
export function resolveUsername(idToUsername, id) {
  if (id == null) return null;
  return idToUsername[`admin:${id}`] || idToUsername[`users:${id}`] || null;
}

// ── SQL table → model docs ─────────────────────────────────────────────────
export function transformSql(sql, rewrite, idToUsername) {
  const fk = (id) => resolveUsername(idToUsername, id); // → username, resolved to ObjectId at load time

  return {
    Administration: (sql.administration || []).map((r) => ({
      roleKey: str(r.role_key), name: str(r.name), designation: str(r.designation),
      photo: rewrite(r.photo, 'images'), profileText: str(r.profile_text),
    })),
    DirectorateContent: (sql.directorate_content || []).map((r) => ({
      directorateKey: str(r.directorate_key), directorName: str(r.director_name),
      directorDesignation: str(r.director_designation), directorPhoto: rewrite(r.director_photo, 'images'),
      aboutText: str(r.about_text),
    })),
    Faculty: (sql.faculty || []).map((r) => ({
      name: str(r.name), designation: str(r.designation), department: str(r.department),
      qualification: str(r.qualification), specialization: str(r.specialization),
      experience: str(r.experience), email: str(r.email), mobile: str(r.mobile),
      researchArea: str(r.research_area), publications: str(r.publications),
      achievements: str(r.achievements), photo: rewrite(r.photo, 'images'),
      isActive: bool(r.is_active), sortOrder: r.sort_order || 0,
    })),
    News: (sql.news || []).map((r) => ({
      title: str(r.title), content: str(r.content), category: str(r.category) || 'General',
      attachment: rewrite(r.attachment, 'documents'), isPublished: bool(r.is_published),
      _fkCreatedBy: fk(r.created_by),
    })),
    SenateDoc: (sql.senate_docs || []).map((r) => ({
      title: str(r.title), url: rewrite(r.url, 'senate'), filename: str(r.filename),
      uploadedBy: str(r.uploaded_by),
    })),
    Regulation: (sql.dap_regulations || []).map((r) => ({ code: str(r.code), sortOrder: r.sort_order || 0 })),
    DacpFile: (sql.dacp_files || []).map((r) => ({
      course: str(r.course), section: str(r.section), programme: str(r.programme),
      subType: str(r.sub_type), regulation: str(r.regulation), type: str(r.type), sno: r.sno || 0,
      title: str(r.title), filename: str(r.filename), filePath: rewrite(r.file_path, 'dacp'),
      fileSize: str(r.file_size), isNewItem: bool(r.is_new),
    })),
    SiteSetting: (sql.site_settings || []).map((r) => ({ key: str(r.setting_key), value: str(r.setting_value) })),
    Notification: (sql.notifications || []).map((r) => ({
      title: str(r.title), category: str(r.category) || 'news', attachment: rewrite(r.attachment, 'documents'),
      isActive: bool(r.is_active), _fkCreatedBy: fk(r.created_by),
    })),
    GalleryItem: (sql.gallery || []).map((r) => ({
      filename: rewrite(r.filename, 'gallery'), caption: str(r.caption), category: str(r.category) || 'General',
    })),
    Mou: (sql.mous || []).map((r) => ({
      orgName: str(r.org_name), mouType: str(r.mou_type) || 'National', document: rewrite(r.document, 'mous'),
      mouDate: toDate(r.mou_date), isActive: bool(r.is_active),
    })),
    HonorisCausa: (sql.honoris_causa || []).map((r) => ({
      name: str(r.name), convocationDate: toDate(r.convocation_date), honorDegree: str(r.honor_degree),
    })),
  };
}

// ── JSON stores → model docs ────────────────────────────────────────────────
export function transformJson(jsonDir, rewrite) {
  const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
  const out = { EMagazine: [], DafaDoc: [], PageContent: [], MediaFolder: [], MediaFile: [] };

  // emagazines.json
  const mags = readJson(path.join(jsonDir, 'emagazines.json')) || [];
  out.EMagazine = mags.map((m) => ({
    monthYear: str(m.month_year_label || m.month_year),
    issueDate: toDate(m.issue_date) || new Date(),
    filename: rewrite(m.link || m.filename, 'magazines'),
  }));

  // dafa_docs/*.json + top-level dafa_docs.json
  const dafaDir = path.join(jsonDir, 'dafa_docs');
  const files = fs.existsSync(dafaDir) ? fs.readdirSync(dafaDir).filter((f) => f.endsWith('.json')) : [];
  const top = readJson(path.join(jsonDir, 'dafa_docs.json'));
  const collect = (arr) => (Array.isArray(arr) ? arr : []).forEach((d) => {
    out.DafaDoc.push({
      section: str(d.section), title: str(d.title),
      url: rewrite(d.url || d.filename, `dafa-docs/${d.section || 'misc'}`),
      filename: str(d.filename), sortOrder: d.sort_order || 0,
      meta: { date: str(d.date), fileSize: d.file_size || 0, legacyId: str(d.id), jsUser: str(d.js_user) },
    });
  });
  files.forEach((f) => collect(readJson(path.join(dafaDir, f))));
  if (Array.isArray(top)) collect(top);

  // dafa_pages.json → PageContent
  const pages = readJson(path.join(jsonDir, 'dafa_pages.json')) || {};
  out.PageContent = Object.entries(pages).map(([key, v]) => ({
    key, heading: str(v.heading), body: str(v.body), updatedBy: str(v.js_user || v.updated_by || ''),
  }));

  // media_library.json → folders + files
  const ml = readJson(path.join(jsonDir, 'media_library.json'));
  if (ml) {
    for (const [id, f] of Object.entries(ml.folders || {})) {
      if (id === 'root') continue;
      out.MediaFolder.push({ _legacyId: id, _legacyParent: f.parent, name: str(f.name), createdBy: str(f.created_by) });
    }
    for (const [id, f] of Object.entries(ml.files || {})) {
      out.MediaFile.push({
        _legacyId: id, _legacyFolder: f.folder,
        originalName: str(f.name), storedName: str(f.safe_name || f.name), ext: str(f.ext),
        mimeType: str(f.mime), fileType: str(f.type) || 'other', size: f.size || 0,
        url: rewrite(f.url, 'media_library'), uploadedBy: str(f.uploaded_by || f.js_user || ''),
      });
    }
  }
  return out;
}
