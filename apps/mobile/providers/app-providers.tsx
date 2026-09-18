import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ListingRepositoryProvider } from '@/features/listings/listing-repository.context';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Nothing is fetched over a network in V1: a failed read is a bug,
          // not a flaky connection.
          queries: { staleTime: 30_000, retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ListingRepositoryProvider>{children}</ListingRepositoryProvider>
    </QueryClientProvider>
  );
}
