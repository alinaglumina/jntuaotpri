import { QueryClient } from '@tanstack/react-query';

// Caching defaults: data stays "fresh" 60s (no refetch), retained 5 min after
// unused, no refetch on window focus. Prefetch-on-hover + loaders warm this.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});
