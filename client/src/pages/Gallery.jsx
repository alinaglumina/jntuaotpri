import PageShell from '../components/PageShell.jsx';
import { GalleryGrid, SkeletonCard, ErrorState, EmptyState } from '../components/index.js';
import { useGallery } from '../api/public.js';

export default function Gallery() {
  const { data = [], isLoading, isError, error } = useGallery();
  const items = data.map((g) => ({ src: g.filename, caption: g.caption }));
  return (
    <PageShell title="JNTUA Gallery" subtitle="Moments and milestones from around the university.">
      {isLoading ? (<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">{Array.from({length:8}).map((_,i)=><SkeletonCard key={i} />)}</div>) : isError ? <ErrorState error={error} /> : items.length === 0
        ? <EmptyState label="Photos will appear here once uploaded." icon="fa-images" />
        : <GalleryGrid items={items} />}
    </PageShell>
  );
}
