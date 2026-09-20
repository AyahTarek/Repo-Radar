/**
 * One page size for the whole app: search fetches this many per request and the
 * tracked view slices this many per page.
 */
export const PAGE_SIZE = 15;

/** GitHub's search API refuses to serve results beyond this offset (HTTP 422). */
export const SEARCH_RESULT_CAP = 1000;

/** Derived, never restated, so changing PAGE_SIZE cannot desynchronise the cap. */
export const MAX_SEARCH_PAGES = Math.floor(SEARCH_RESULT_CAP / PAGE_SIZE);

export const FIRST_PAGE = 1;
