import { useState, useEffect } from 'react';
// Client-side paging: returns the current slice (default 25 rows) plus controls.
export default function usePagination(rows = [], pageSize = 25) {
  const [page, setPage] = useState(1);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => { if (page > pages) setPage(1); }, [page, pages]);
  const cur = Math.min(page, pages);
  const offset = (cur - 1) * pageSize;
  return { rows: rows.slice(offset, offset + pageSize), page: cur, setPage, total, pageSize, offset };
}
