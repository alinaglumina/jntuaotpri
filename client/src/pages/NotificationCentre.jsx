import { useState, useEffect, useRef, useCallback } from 'react';
import PageShell from '../components/PageShell.jsx';
import { NoticeCard, Card, SkeletonList, ErrorState, EmptyState, Spinner } from '../components/index.js';
import { useInfiniteNotifications } from '../api/public.js';

const TABS = [['news', 'Latest News'], ['exam', 'Examinations'], ['admission', 'Admissions'], ['research', 'R&D'], ['placement', 'Placements'], ['sports', 'Sports'], ['tenders', 'Tenders']];

export default function NotificationCentre() {
  const [cat, setCat] = useState('news');
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotifications(cat);

  // IntersectionObserver sentinel → load the next page when it scrolls into view.
  const sentinel = useRef(null);
  const onIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { rootMargin: '200px' });
    obs.observe(el); return () => obs.disconnect();
  }, [onIntersect]);

  const items = data?.pages.flatMap((p) => p.items || []) || [];

  return (
    <PageShell title="Notification Centre" subtitle="University news, notices and announcements.">
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setCat(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${cat === key ? 'bg-navy text-white' : 'bg-surface text-brand hover:bg-navy/5'}`}>{label}</button>
        ))}
      </div>

      {isLoading ? <SkeletonList items={8} /> : isError ? <ErrorState error={error} /> : items.length === 0 ? (
        <EmptyState label="No notifications in this category yet." icon="fa-bell" />
      ) : (
        <>
          <Card><div className="divide-y divide-line">
            {items.map((n) => <NoticeCard key={n._id} id={n._id} title={n.title} category={n.category} date={n.publishedAt || n.createdAt} attachments={n.attachments} attachmentsNames={n.attachmentsNames} />)}
          </div></Card>
          {/* Infinite-scroll sentinel */}
          <div ref={sentinel} className="grid place-items-center py-6">
            {isFetchingNextPage ? <Spinner /> : hasNextPage ? <span className="text-xs text-muted">Scroll for more…</span> : <span className="text-xs text-muted">— End —</span>}
          </div>
        </>
      )}
    </PageShell>
  );
}
