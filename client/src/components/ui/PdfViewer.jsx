// PDF viewer using the browser's native renderer (no heavy dependency).
export default function PdfViewer({ url, title = 'Document', height = 600 }) {
  if (!url) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-card">
      <div className="flex items-center justify-between bg-navy/5 px-4 py-2">
        <span className="truncate text-sm font-medium text-navy"><i className="fa-solid fa-file-pdf mr-2 text-crimson" aria-hidden="true" />{title}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-crimson">Open in new tab</a>
      </div>
      <object data={url} type="application/pdf" width="100%" height={height} aria-label={title}>
        <div className="p-6 text-center text-sm text-slate-500">
          Your browser can’t display PDFs inline. <a href={url} target="_blank" rel="noopener noreferrer" className="text-crimson">Download the PDF</a>.
        </div>
      </object>
    </div>
  );
}
