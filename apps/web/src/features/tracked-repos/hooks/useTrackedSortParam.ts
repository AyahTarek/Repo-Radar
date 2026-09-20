import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { SEARCH_PARAM_KEYS } from "@/app/router/routes";
import { STORAGE_KEYS } from "@/constants/storage";
import { parseTrackedSortParam } from "../helpers/sortParam";
import type { TrackedSortOption } from "../types";

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
  // Falling back to the last sort picked on this page - not the hard default -
  // is what makes the choice survive leaving the page and coming back, since
  // the nav links themselves carry no query string.
  const sort = parseTrackedSortParam(
    searchParams.get(SEARCH_PARAM_KEYS.sort) ??
      localStorage.getItem(STORAGE_KEYS.trackedSort),
  );

  // The localStorage fallback only affects what `sort` resolves to in memory;
  // without this, the address bar would silently disagree with what's on screen.
  useEffect(() => {
    if (searchParams.get(SEARCH_PARAM_KEYS.sort) !== null) return;

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(SEARCH_PARAM_KEYS.sort, sort);
        return next;
      },
      { replace: true },
    );
  }, [searchParams, sort, setSearchParams]);

  const setSort = useCallback(
    (nextSort: TrackedSortOption) => {
      localStorage.setItem(STORAGE_KEYS.trackedSort, nextSort);
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
