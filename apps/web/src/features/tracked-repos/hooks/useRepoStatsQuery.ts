import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { RepoStats } from '@/types/repo';
import { fetchRepoStats } from '../service/fetchRepoStats';

type RepoStatsQueryResult = {
  stats: RepoStats | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refresh: () => void;
};

/**
 * One query per repo, which is what gives every card genuinely independent
 * loading and error state: a 404 on one repo cannot affect its neighbours, and no
 * status map has to be maintained anywhere.
 */
export function useRepoStatsQuery(fullName: string): RepoStatsQueryResult {
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: queryKeys.repo(fullName),
    queryFn: ({ signal }) => fetchRepoStats({ fullName, signal }),
  });

  return {
    stats: data,
    isLoading: isPending,
    // Distinguishing the two keeps already-visible stats on screen during a refresh.
    isRefreshing: isFetching && !isPending,
    error,
    refresh: () => void refetch(),
  };
}
