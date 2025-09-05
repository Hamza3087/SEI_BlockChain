import * as ReactQuery from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GC_TIME, SHORT_STALE_TIME } from './consts';

const queryClient = new ReactQuery.QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: SHORT_STALE_TIME,
      gcTime: GC_TIME,
    },
  },
});

export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ReactQuery.QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} position={'bottom'} />
  </ReactQuery.QueryClientProvider>
);
