import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/queryKeys';

type RefreshAllResult = {
  refreshAll: () => void;
  /** Derived from the cache, never stored - so it cannot go stale. */
  isRefreshing: boolean;
};

/**
 * `refetchType: 'active'` refetches only mounted queries, which - because the
 * tracked list is paginated - means the 15 repos on screen rather than the whole
 * watchlist. That is what keeps one click from spending an entire hourly quota.
 */
export function useRefreshPageRepos(): RefreshAllResult {
  const queryClient = useQueryClient();
  const activeCount = useIsFetching({ queryKey: queryKeys.repos() });

  const refreshAll = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.repos(),
      refetchType: 'active',
    });
  }, [queryClient]);

  return { refreshAll, isRefreshing: activeCount > 0 };
}
