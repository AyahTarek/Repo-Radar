import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { queryKeys } from '@/lib/queryKeys';

type RefreshAllResult = {
  refreshAll: () => void;
  isRefreshing: boolean;
};

/**
 * `refetchType: 'active'` refetches only mounted queries, which - because the
 * tracked list is paginated - means the 15 repos on screen rather than the whole
 * watchlist. That is what keeps one click from spending an entire hourly quota.
 *
 * `isRefreshing` is tracked with local state tied to this invalidation call
 * rather than `useIsFetching`, because `useIsFetching({ queryKey: ['repo'] })`
 * uses prefix-matching and would also fire when a single repo card is refreshed
 * individually — causing the "Refresh all" button to show a spinner for an
 * unrelated operation.
 */
export function useRefreshPageRepos(): RefreshAllResult {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.repos(),
      refetchType: 'active',
    });
    setIsRefreshing(false);
  }, [queryClient]);

  return { refreshAll, isRefreshing };
}
