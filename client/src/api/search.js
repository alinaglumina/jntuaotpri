import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios.js';

// Global search. Returns { query, groups:[{type,label,icon,items,count}], total }.
export function useSearch(q, { limit = 6, enabled = true } = {}) {
  const term = (q || '').trim();
  return useQuery({
    queryKey: ['search', term, limit],
    queryFn: () => api.get('/search', { params: { q: term, limit } }),
    enabled: enabled && term.length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// Popular search terms (for the empty palette state).
export function usePopularSearches(enabled = true) {
  return useQuery({
    queryKey: ['search-popular'],
    queryFn: () => api.get('/search/popular', { params: { limit: 6 } }),
    enabled, staleTime: 5 * 60_000,
  });
}
