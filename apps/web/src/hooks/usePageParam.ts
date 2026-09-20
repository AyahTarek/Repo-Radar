import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import { SEARCH_PARAM_KEYS } from '@/app/router/routes';
import { FIRST_PAGE } from '@/constants/pagination';
import { parseOrFallback } from '@/lib/validation';

const pageSchema = z.coerce.number().int().positive();

/**
 * `?page=` is untrusted input, so `abc`, `-3` and `1e9` all resolve to a legal
 * page. Clamping against the real page count stays with the caller, which is the
 * only place that knows how many items exist.
 */
type SetPageOptions = {
  /**
   * Use for corrections such as clamping an out-of-range page: pushing those onto
   * history would let Back return to the invalid page and bounce straight out again.
   */
  replace?: boolean;
};

export function usePageParam(): {
  page: number;
  setPage: (page: number, options?: SetPageOptions) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseOrFallback(pageSchema, searchParams.get(SEARCH_PARAM_KEYS.page), FIRST_PAGE);

  const setPage = useCallback(
    (nextPage: number, { replace = false }: SetPageOptions = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          if (nextPage <= FIRST_PAGE) {
            next.delete(SEARCH_PARAM_KEYS.page);
          } else {
            next.set(SEARCH_PARAM_KEYS.page, String(nextPage));
          }

          return next;
        },
        // Deliberate paging is navigation and belongs in history; a clamp does not.
        { replace },
      );
    },
    [setSearchParams],
  );

  return { page, setPage };
}
