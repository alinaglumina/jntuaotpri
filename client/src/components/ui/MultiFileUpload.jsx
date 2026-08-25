import { useRef, useState } from 'react';
// Multi-file picker (drag-and-drop + click) for non-image documents (PDFs,
// docs, etc). Accumulates File objects (up to `max`) and reports the full
// array via onFiles. Shows filenames + remove buttons instead of thumbnails.
export default function MultiFileUpload({ label, current = [], onFiles, max = 8, hint }) {
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    const next = [...files, ...incoming].slice(0, max);
    setFiles(next);
    onFiles(next);
  };
  const removeAt = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    onFiles(next);
  };

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        className={`cursor-pointer rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition ${drag ? 'border-crimson bg-crimson/5' : 'border-slate-300 hover:border-navy'}`}
      >
        <i className="fa-solid fa-cloud-arrow-up mb-1 block text-xl text-navy" aria-hidden="true" />
        <span className="text-slate-500">Drop files or <span className="text-crimson">browse</span> (max {max})</span>
        <input ref={ref} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded border border-line bg-canvas px-3 py-1.5 text-sm">
              <span className="flex items-center gap-2 truncate text-slate-700"><i className="fa-solid fa-file-lines text-navy" aria-hidden="true" />{f.name}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); removeAt(i); }} className="ml-2 text-crimson hover:text-crimson-700">
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && current.length > 0 && (
        <ul className="mt-2 space-y-1">
          {current.map((url, i) => (
            <li key={i}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded border border-line bg-canvas px-3 py-1.5 text-sm text-crimson hover:underline">
                <i className="fa-solid fa-file-lines" aria-hidden="true" />File {i + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
