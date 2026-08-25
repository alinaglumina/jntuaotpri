import { useState } from 'react';
import ImageViewer from './ui/ImageViewer.jsx';
import Img from './ui/Img.jsx';
// Responsive image grid that opens a lightbox. items: [{ src, caption? }].
export default function GalleryGrid({ items = [], cols = 4 }) {
  const [open, setOpen] = useState(-1);
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[cols] || 'grid-cols-2 md:grid-cols-4';
  return (
    <>
      <div className={`grid gap-4 ${colClass}`}>
        {items.map((g, i) => (
          <figure key={i} className="group cursor-pointer overflow-hidden rounded-lg bg-surface shadow-card" onClick={() => setOpen(i)}>
            <Img src={g.src} alt={g.caption || 'Gallery image'} className="h-40 w-full" imgClassName="transition group-hover:scale-105" />
            {g.caption && <figcaption className="px-3 py-2 text-xs text-slate-600">{g.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {open >= 0 && <ImageViewer images={items.map((x) => ({ src: x.src, caption: x.caption }))} index={open} onClose={() => setOpen(-1)} />}
    </>
  );
}
