import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // data is "fresh" for 5 min — no refetch within this window
      gcTime: 24 * 60 * 60 * 1000, // keep in cache for 24h (persisted to localStorage via main.jsx)
      retry: (failureCount, error) => {
        // Never retry on auth errors — avoids redirect loops
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 1;
      },
    },
  },
});
