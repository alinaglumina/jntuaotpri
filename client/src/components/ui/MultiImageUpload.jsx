import { useRef, useState } from 'react';
// Multi-file image picker (drag-and-drop + click). Accumulates File objects
// (up to `max`) and reports the full array via onFiles. Shows thumbnails for
// newly picked files and links to any already-saved URLs (`current`).
export default function MultiImageUpload({ label, current = [], onFiles, min = 4, max = 8, hint }) {
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);

  const addFiles = (list) => {
    const incoming = Array.from(list || []).filter((f) => f.type.startsWith('image/'));
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
        <i className="fa-solid fa-images mb-1 block text-xl text-navy" aria-hidden="true" />
        <span className="text-slate-500">Drop images or <span className="text-crimson">browse</span> (min {min}, max {max})</span>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} alt={f.name} className="h-16 w-16 rounded object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-crimson text-white">
                <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length === 0 && current.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {current.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={`Current ${i + 1}`} className="h-16 w-16 rounded object-cover" />
            </a>
          ))}
        </div>
      )}
      {files.length > 0 && files.length < min && (
        <p className="mt-1 text-xs text-crimson">Please add at least {min} images ({files.length}/{min}).</p>
      )}
    </div>
  );
}
