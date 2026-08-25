import DOMPurify from 'dompurify';

// Renders admin/Quill HTML (news, directorate about, page bodies) after
// client-side sanitization — defence-in-depth on top of the server sanitizer.
export default function SafeHtml({ html, className = '' }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <div className={`prose-jntua max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
