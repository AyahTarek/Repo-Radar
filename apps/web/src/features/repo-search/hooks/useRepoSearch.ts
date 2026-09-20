import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FIRST_PAGE } from '@/constants/pagination';
import { queryKeys } from '@/lib/queryKeys';
import type { RepoSummary } from '@/types/repo';
import { MIN_QUERY_LENGTH } from '../constants';
import { flattenPages, getNextPageParam, reachableTotal } from '../helpers/paging';
import { searchRepos } from '../service/searchRepos';
import type { RepoSortOption } from '../types';

type RepoSearchResult = {
  repos: readonly RepoSummary[];
  /** Total the user can actually page to, already capped at GitHub's ceiling. */
  totalCount: number;
  isIdle: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  retry: () => void;
};

export function useRepoSearch(query: string, sort: RepoSortOption): RepoSearchResult {
  const isEnabled = query.length >= MIN_QUERY_LENGTH;

  const {
    data,
    error,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.repoSearch(query, sort),
    // React Query's signal is forwarded so a superseded search is aborted.
    queryFn: ({ pageParam, signal }) => searchRepos({ query, sort, page: pageParam, signal }),
    initialPageParam: FIRST_PAGE,
    getNextPageParam,
    enabled: isEnabled,
  });

  const repos = useMemo(() => (data === undefined ? [] : flattenPages(data.pages)), [data]);
  const totalCount = reachableTotal(data?.pages.at(0)?.totalCount ?? 0);

  return {
    repos,
    totalCount,
    isIdle: !isEnabled,
    // `isPending` stays true while disabled, so the first-load skeleton has to
    // depend on an actual in-flight request.
    isLoading: isEnabled && isPending && isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage: () => void fetchNextPage(),
    retry: () => void refetch(),
  };
}
