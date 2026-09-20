import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { SEARCH_PARAM_KEYS } from '@/app/router/routes';
import { parseTrackedSortParam } from '../helpers/sortParam';
import type { TrackedSortOption } from '../types';

type TrackedSortParam = {
  sort: TrackedSortOption;
  setSort: (sort: TrackedSortOption) => void;
};

/**
 * Mirrors the sort in `?sort=` so a shared or reloaded `/tracked` link reopens
 * showing the repos in the order the user left them, the same way search's own
 * `?sort=` survives reload.
 */
export function useTrackedSortParam(): TrackedSortParam {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = parseTrackedSortParam(searchParams.get(SEARCH_PARAM_KEYS.sort));

  const setSort = useCallback(
    (nextSort: TrackedSortOption) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(SEARCH_PARAM_KEYS.sort, nextSort);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { sort, setSort };
}
