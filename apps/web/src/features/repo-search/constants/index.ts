/** Long enough to skip mid-word requests, short enough to feel instant. */
export const DEBOUNCE_MS = 400;

/** Single characters match half of GitHub; not worth a request. */
export const MIN_QUERY_LENGTH = 2;

/** GitHub rejects search queries longer than this. */
export const MAX_QUERY_LENGTH = 256;

export const REPO_SORT_OPTIONS = [
  { value: 'best-match', label: 'Best match' },
  { value: 'stars', label: 'Most stars' },
  { value: 'updated', label: 'Recently updated' },
] as const;

export const DEFAULT_REPO_SORT = 'best-match';

/** Start the next page slightly before the sentinel enters the viewport. */
export const SENTINEL_ROOT_MARGIN = '240px';
