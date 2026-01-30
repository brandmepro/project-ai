'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/lib/theme';
import { useState } from 'react';

export function MantineProviders({ children }: { children: React.ReactNode }) {
  // Create QueryClient with optimal defaults for idempotency
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 5 seconds to prevent unnecessary refetches
            staleTime: 5000,
            // Retry failed requests twice (safe for GET requests)
            retry: 2,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus by default (can be enabled per query)
            refetchOnWindowFocus: false,
            // Refetch on mount only if data is stale
            refetchOnMount: 'always',
          },
          mutations: {
            // Retry mutations once (be cautious with POST/PUT/DELETE)
            retry: 1,
            // Retry delay for mutations
            retryDelay: 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
