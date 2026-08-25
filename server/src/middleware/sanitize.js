import sanitizeHtml from 'sanitize-html';

// Fields that legitimately contain rich HTML (from the Quill editors). Only
// these are allowed to keep markup; everything else is treated as plain text.
const HTML_FIELDS = new Set(['content', 'aboutText', 'profileText', 'body']);

const OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 'span', 'figure', 'figcaption']),
  allowedAttributes: {
    '*': ['style', 'class'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
};

// Strips dangerous markup from request bodies before they reach controllers.
// HTML fields are sanitized (kept safe, entities preserved for correct HTML
// rendering). Plain-text fields just have tags stripped — no entity encoding,
// since these are rendered as plain text (React escapes them safely on its
// own), and encoding here would corrupt characters like "&" into "&amp;".
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [k, v] of Object.entries(req.body)) {
      if (typeof v !== 'string') continue;
      req.body[k] = HTML_FIELDS.has(k)
        ? sanitizeHtml(v, OPTIONS)
        : v.replace(/<[^>]*>/g, '');
    }
  }
  next();
}
