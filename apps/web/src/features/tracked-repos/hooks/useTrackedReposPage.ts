import { useEffect, useMemo } from 'react';
import { usePageParam } from '@/hooks/usePageParam';
import { clampPage, pageCount, pageSlice } from '../helpers/paginate';
import type { TrackedRepo, TrackedSortOption } from '../types';
import { useSortedTrackedRepos } from './useTrackedRepos';

type TrackedReposPage = {
  /** The repos on screen - the only ones that mount a stats query. */
  repos: readonly TrackedRepo[];
  page: number;
  totalPages: number;
  totalCount: number;
  setPage: (page: number) => void;
};

export function useTrackedReposPage(sort: TrackedSortOption): TrackedReposPage {
  const allRepos = useSortedTrackedRepos(sort);
  const { page, setPage } = usePageParam();

  const totalCount = allRepos.length;
  const totalPages = pageCount(totalCount);
  const safePage = clampPage(page, totalCount);

  // Untracking the last item on the last page would otherwise leave the user on
  // an empty page. Replaced, not pushed, so Back does not return to it.
  useEffect(() => {
    if (page !== safePage) setPage(safePage, { replace: true });
  }, [page, safePage, setPage]);

  const repos = useMemo(() => pageSlice(allRepos, safePage), [allRepos, safePage]);

  return { repos, page: safePage, totalPages, totalCount, setPage };
}
