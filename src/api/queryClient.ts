// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache records for 5 minutes before re-fetching
      refetchOnWindowFocus: false, // Prevent aggressive re-fetching when clicking tabs
      retry: 1, // Retry failed network handshakes once before showing an error bar
    },
  },
});