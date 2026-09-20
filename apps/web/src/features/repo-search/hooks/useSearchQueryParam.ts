import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { SEARCH_PARAM_KEYS } from "@/app/router/routes";
import { STORAGE_KEYS } from "@/constants/storage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DEBOUNCE_MS, MAX_QUERY_LENGTH } from "../constants";
import { parseQueryParam, parseSortParam } from "../helpers/searchParams";
import type { RepoSortOption } from "../types";

type SearchQueryState = {
  /** What the input shows - updates on every keystroke. */
  inputValue: string;
  /** What the query uses - trails the input by DEBOUNCE_MS. */
  debouncedQuery: string;
  sort: RepoSortOption;
  setInputValue: (value: string) => void;
  setSort: (sort: RepoSortOption) => void;
};

/**
 * The input is the source of truth while typing; the URL mirrors the settled
 * value so a shared link reproduces the search without making the field laggy.
 */
export function useSearchQueryParam(): SearchQueryState {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = parseQueryParam(searchParams.get(SEARCH_PARAM_KEYS.query));
  // Falling back to the last sort picked on this page - not the hard default -
  // is what makes the choice survive leaving the page and coming back, since
  // the nav links themselves carry no query string.
  const sort = parseSortParam(
    searchParams.get(SEARCH_PARAM_KEYS.sort) ??
      localStorage.getItem(STORAGE_KEYS.searchSort),
  );

  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(
    inputValue.trim().slice(0, MAX_QUERY_LENGTH),
    DEBOUNCE_MS,
  );

  // Writing the settled value with `replace` keeps one history entry per search
  // instead of one per keystroke.
  useEffect(() => {
    if (debouncedQuery === urlQuery) return;

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (debouncedQuery.length === 0) {
          next.delete(SEARCH_PARAM_KEYS.query);
        } else {
          next.set(SEARCH_PARAM_KEYS.query, debouncedQuery);
        }

        return next;
      },
      { replace: true },
    );
  }, [debouncedQuery, urlQuery, setSearchParams]);

  const setSort = useCallback(
    (nextSort: RepoSortOption) => {
      localStorage.setItem(STORAGE_KEYS.searchSort, nextSort);
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

  return { inputValue, debouncedQuery, sort, setInputValue, setSort };
}
