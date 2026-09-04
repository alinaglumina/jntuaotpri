import { useGallery } from '../api/public.js';

// Public gallery: one section per event, each showing the event name and a
// responsive grid of its photos (opens full-size in a new tab on click).
export default function GalleryDisplay() {
  const { data = [], isLoading } = useGallery();

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No gallery items yet.</p>;

  return (
    <div className="space-y-10">
      {data.map((g) => (
        <div key={g._id}>
          <h3 className="mb-3 font-display text-xl font-semibold text-navy">{g.eventName}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(g.images || []).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg shadow-card">
                <img src={url} alt={`${g.eventName} ${i + 1}`} className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
