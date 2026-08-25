import fs from 'fs';

/**
 * Minimal mysqldump parser: extracts INSERT rows as JS objects keyed by table.
 * Handles single- and multi-row INSERTs, quoted strings with \\' \\" \\\\ and
 * doubled '' escapes, NULL, and numbers. Good enough for content dumps (not a
 * full SQL engine). Returns { tableName: [ {col: value, ...}, ... ] }.
 */
export function parseSqlDump(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const tables = {};

  // Match each INSERT INTO `tbl` (`c1`,`c2`,...) VALUES <...>;
  const insertRe = /INSERT INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*(.+?);\s*(?=INSERT INTO|CREATE TABLE|--|\/\*|$)/gis;
  let m;
  while ((m = insertRe.exec(sql)) !== null) {
    const table = m[1];
    const cols = m[2].split(',').map((c) => c.trim().replace(/`/g, ''));
    const rows = splitRows(m[3]);
    tables[table] ??= [];
    for (const raw of rows) {
      const vals = parseTuple(raw);
      if (vals.length !== cols.length) continue; // skip malformed
      const obj = {};
      cols.forEach((c, i) => { obj[c] = vals[i]; });
      tables[table].push(obj);
    }
  }
  return tables;
}

// Split "(...),(...),(...)" into individual "..." tuple bodies, respecting quotes.
function splitRows(s) {
  const rows = [];
  let depth = 0, inStr = false, q = '', buf = '', started = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      buf += ch;
      if (ch === '\\') { buf += s[++i] ?? ''; continue; }
      if (ch === q) {
        if (s[i + 1] === q) { buf += s[++i]; continue; } // doubled quote
        inStr = false;
      }
      continue;
    }
    if (ch === "'" || ch === '"') { inStr = true; q = ch; buf += ch; continue; }
    if (ch === '(') { depth++; if (depth === 1) { started = true; buf = ''; continue; } }
    if (ch === ')') { depth--; if (depth === 0) { rows.push(buf); started = false; continue; } }
    if (started) buf += ch;
  }
  return rows;
}

// Parse a single tuple body "1, 'a', NULL, 3" into typed values.
function parseTuple(s) {
  const out = [];
  let inStr = false, q = '', buf = '', i = 0;
  const push = (v) => out.push(v);
  while (i < s.length) {
    const ch = s[i];
    if (inStr) {
      if (ch === '\\') { buf += unescapeChar(s[i + 1]); i += 2; continue; }
      if (ch === q) {
        if (s[i + 1] === q) { buf += q; i += 2; continue; }
        inStr = false; i++; continue;
      }
      buf += ch; i++; continue;
    }
    if (ch === "'" || ch === '"') { inStr = true; q = ch; buf = ''; i++; continue; }
    if (ch === ',') { push(coerce(buf)); buf = ''; i++; continue; }
    buf += ch; i++;
  }
  push(coerce(buf));
  return out;
}

function unescapeChar(c) {
  const map = { n: '\n', t: '\t', r: '\r', '0': '\0', b: '\b', "'": "'", '"': '"', '\\': '\\' };
  return map[c] ?? c;
}
function coerce(raw) {
  const t = raw.trim();
  if (t === '' ) return '';           // came from a quoted empty string
  if (t.toUpperCase() === 'NULL') return null;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d*\.\d+$/.test(t)) return parseFloat(t);
  return raw; // string content (already unescaped)
}
