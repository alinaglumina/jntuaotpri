import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Reusable auto-advancing hero carousel. slides: [{ image?, title }].
// Heading renders as a full-width bar flush at the bottom of the slide,
// styled like the site's top ribbon (slim, dark bar, full width).
export default function HeroSlider({ slides = [], interval = 6000, height = 'min-h-[480px]' }) {
  const items = slides.length ? slides : [{ _id: 'd', title: 'Welcome to JNTUA' }];
  const [i, setI] = useState(0);
  const go = useCallback((d) => setI((p) => (p + d + items.length) % items.length), [items.length]);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => go(1), interval); return () => clearInterval(t); }, [go, interval, items.length]);
  const s = items[i % items.length];
  return (
    <section className={`relative overflow-hidden bg-navy-900 text-navy ${height}`}>
      <AnimatePresence mode="sync">
        {s.image && (
          <motion.img key={s._id || i} src={s.image} alt=""
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover" />
        )}
      </AnimatePresence>

      {/* Depth wash: darkens top and bottom so text/controls stay legible over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />

      {items.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/25">‹</button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/25">›</button>
        </>
      )}

      {/* Full-width heading bar flush at the bottom, matching the top ribbon's style */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900 via-navy-900/95 to-navy-900/70 text-white/90 backdrop-blur-[2px]">
        <div className="container relative flex items-center justify-center py-2.5">
          <AnimatePresence mode="wait">
            <motion.h2 key={s._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center font-display text-sm font-semibold text-white md:text-base">
              {s.title}
            </motion.h2>
          </AnimatePresence>
          {items.length > 1 && (
            <div className="absolute right-0 flex shrink-0 gap-2">
              {items.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 w-2 rounded-full ${k === i % items.length ? 'bg-gold' : 'bg-white/30'}`} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
