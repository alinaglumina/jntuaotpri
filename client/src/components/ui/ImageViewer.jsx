import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Lightbox gallery viewer. images: [{ src, alt?, caption? }]. Arrow keys + swipe.
export default function ImageViewer({ images = [], index = 0, onClose }) {
  const [i, setI] = useState(index);
  useEffect(() => setI(index), [index]);
  const go = useCallback((d) => setI((p) => (p + d + images.length) % images.length), [images.length]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);
  if (!images.length) return null;
  const img = images[i];
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <button className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white" onClick={onClose} aria-label="Close">✕</button>
        {images.length > 1 && <button className="absolute left-4 text-3xl text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">‹</button>}
        <figure className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <img src={img.src} alt={img.alt || ''} className="mx-auto max-h-[80vh] rounded object-contain" />
          {img.caption && <figcaption className="mt-2 text-center text-sm text-white/70">{img.caption}</figcaption>}
        </figure>
        {images.length > 1 && <button className="absolute right-4 text-3xl text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">›</button>}
      </motion.div>
    </AnimatePresence>
  );
}
