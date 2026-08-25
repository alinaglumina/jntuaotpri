import { useRef, useState } from 'react';
// Drag-and-drop + click file input. Returns a File via onFile. Shows current URL.
export default function FileUpload({ label, accept, current, onFile, hint }) {
  const ref = useRef(null);
  const [name, setName] = useState('');
  const [drag, setDrag] = useState(false);
  const pick = (f) => { if (!f) return; setName(f.name); onFile(f); };
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        className={`cursor-pointer rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition ${drag ? 'border-crimson bg-crimson/5' : 'border-slate-300 hover:border-navy'}`}
      >
        <i className="fa-solid fa-cloud-arrow-up mb-1 block text-xl text-navy" aria-hidden="true" />
        {name ? <span className="font-medium text-navy">{name}</span> : <span className="text-slate-500">Drop a file or <span className="text-crimson">browse</span></span>}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {!name && current && <a href={current} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-crimson">View current file</a>}
    </div>
  );
}
