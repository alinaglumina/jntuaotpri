import { useState, useMemo } from 'react';
import { useEvents } from '../api/public.js';

// Flattens every event's images[] into individual slides, each carrying its
// parent event's title. Falls back to `banner` if an event has no gallery
// images yet, so newly created events still show something.
function buildSlides(events) {
  const slides = [];
  events.forEach((ev) => {
    const imgs = Array.isArray(ev.images) && ev.images.length > 0 ? ev.images : (ev.banner ? [ev.banner] : []);
    imgs.forEach((src) => slides.push({ name: ev.title, image: src }));
  });
  return slides;
}

export default function EventsSlider() {
  const { data = [], isLoading } = useEvents();
  const slides = useMemo(() => buildSlides(data), [data]);
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  if (isLoading) {
    return <div className="skeleton h-64 w-full rounded-lg sm:h-72" />;
  }
  if (total === 0) {
    return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No events to show yet.</p>;
  }

  const current = slides[index % total];

  return (
    <div className="relative overflow-hidden rounded-lg shadow-card">
      <div className="relative h-64 w-full sm:h-72">
        <img src={current.image} alt={current.name} className="h-full w-full object-cover" />
        {/* Event name banner, overlaid on top of the slide */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
          <h4 className="text-base font-semibold text-white drop-shadow sm:text-lg">{current.name}</h4>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Previous event"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button onClick={next} aria-label="Next event"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${i === index % total ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
