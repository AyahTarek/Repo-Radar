import { QueryClient } from '@tanstack/react-query';
import {
  GC_TIME_MS,
  MAX_RETRIES,
  MAX_RETRY_DELAY_MS,
  RETRY_BASE_DELAY_MS,
  STALE_TIME_MS,
} from '@/constants/query';
import { isRetryableApiError } from '@/lib/github/errors';

const RETRY_BACKOFF_FACTOR = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        // Retrying a 404 or an exhausted quota only wastes the little quota left,
        // so the decision is delegated to the error kind.
        retry: (failureCount, error) =>
          failureCount < MAX_RETRIES && isRetryableApiError(error),
        retryDelay: (attempt) =>
          Math.min(RETRY_BASE_DELAY_MS * RETRY_BACKOFF_FACTOR ** attempt, MAX_RETRY_DELAY_MS),
        // Unauthenticated GitHub allows 60 requests/hour; refetching every time
        // the user alt-tabs would spend it on nothing. Refresh is explicit here.
        refetchOnWindowFocus: false,
      },
    },
  });
}
